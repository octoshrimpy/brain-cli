/*
	Text Machine

	Copyright (c) 2018 - 2022 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/* A XML parser */



const prog = {
	hostConfig: {	// Accessible by the host
	} ,
	config: {
		initState: 'idle'
	} ,
	styles: {
		idle: { color: 'white' } ,
		operator: { color: 'brightWhite' , bold: true } ,

		// <? ... ?>
		declarationTag: { color: 'brightMagenta' } ,
		declarationTagName: { color: 'magenta' } ,
		declarationTagAttributeName: { color: 'magenta' } ,

		// <! ... >
		definitionTag: { color: 'brightMagenta' } ,
		definitionTagName: { color: 'magenta' } ,
		definitionTagAttributeName: { color: 'magenta' } ,
		definitionTagBracket: { color: 'brightMagenta' , bold: true } ,

		tag: { color: 'brightYellow' } ,
		tagName: { color: 'yellow' } ,
		tagAttributeName: { color: 'green' } ,

		number: { color: 'cyan' } ,
		entity: { color: 'cyan' } ,
		string: { color: 'blue' } ,
		escape: { color: 'brightCyan' , bold: true } ,

		comment: { color: 'gray' } ,
		cdata: { color: 'white' } ,
		property: { color: 'green' } ,

		parseError: { color: 'brightWhite' , bgColor: 'red' , bold: true }
	} ,
	states: {
		idle: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '<' ,
					state: 'maybeTag'
				} ,
				{
					match: ']' ,
					matchMicroState: 'nestedDefinitionTag' ,
					state: 'closeNestedDefinitionTag'
				} ,
				{
					match: '&' ,
					state: 'entity'
				}
			]
		} ,
		entity: {
			action: [ 'style' , 'entity' ] ,
			branches: [
				{
					match: /[#a-z0-9]/ ,
					state: 'entityName'
				} ,
				{
					action: [ 'streakStyle' , 'parseError' ] ,
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		entityName: {
			action: [ 'style' , 'entity' ] ,
			branches: [
				{
					match: /[a-z0-9]/ ,
					state: 'entityName'
				} ,
				{
					match: ';' ,
					state: 'idle' ,
					delay: true
				} ,
				{
					action: [ 'streakStyle' , 'parseError' ] ,
					state: 'idle' ,
					propagate: true
				}
			]
		} ,



		maybeTag: {
			action: [ 'style' , 'tag' ] ,
			startSpan: 'tag' ,
			branches: [
				{
					match: '/' ,
					state: 'closeTag'
				} ,
				{
					// Declaration: <? ... ?>
					match: '?' ,
					action: [ 'spanStyle' , 'tag' , 'declarationTag' ] ,
					state: 'declarationTag'
				} ,
				{
					// Could be a comments <!-- ... -->
					// Could be a <!DOCTYPE html> or <!ENTITY ... >
					// Could be a <![CDATA[ ... ]]>
					match: '!' ,
					state: 'maybeComment'
				} ,
				{
					state: 'openTag' ,
					propagate: true
				}
			]
		} ,
		openTag: {
			action: [ 'style' , 'tag' ] ,
			microState: { openTag: false } ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'openTagName' ,
					propagate: true
				}
			]
		} ,
		openTagName: {
			action: [ 'style' , 'tagName' ] ,
			span: 'tagName' ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'openTagName'
				} ,
				{
					state: 'afterOpenTagName' ,
					microState: { openTag: [ 'span' , 'tagName' ] } ,
					propagate: true
				}
			]
		} ,
		afterOpenTagName: {
			action: [ 'style' , 'tagName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '>' ,
					state: 'endOpenTag'
				} ,
				{
					match: '/' ,
					state: 'maybeSelfClosingTag'
				} ,
				{
					match: /[ \t\n]/ ,
					state: 'openTagAttributesPart'
				} ,
				{
					state: 'openTagError'
				}
			]
		} ,
		maybeSelfClosingTag: {
			action: [ 'style' , 'tag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '>' ,
					state: 'endSelfClosingTag'
				} ,
				{
					state: 'openTagAttributesPart' ,
					propagate: true
				}
			]
		} ,
		endSelfClosingTag: {
			action: [ 'style' , 'tag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		endOpenTag: {
			action: [ 'style' , 'tag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					subState: 'openTagContent' ,
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		openTagContent: {
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		openTagAttributesPart: {
			action: [ 'style' , 'tag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'openTagAttributeName' ,
					propagate: true
				} ,
				{
					match: '>' ,
					state: 'endOpenTag'
				} ,
				{
					match: '/' ,
					state: 'maybeSelfClosingTag'
				}
			]
		} ,
		openTagAttributeName: {
			action: [ 'style' , 'tagAttributeName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'openTagAttributeName'
				} ,
				{
					match: '>' ,
					state: 'endOpenTag'
				} ,
				{
					match: '/' ,
					state: 'maybeSelfClosingTag'
				} ,
				{
					match: '=' ,
					state: 'openTagAttributeEqual'
				}
			]
		} ,
		openTagAttributeEqual: {
			action: [ 'style' , 'operator' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'openTagAttributeValue' ,
					propagate: true
				}
			]
		} ,
		openTagAttributeValue: {
			action: [ 'style' , 'string' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '"' ,
					subState: 'doubleQuoteAttributeValue' ,
					state: 'openTagAttributesPart'
				} ,
				{
					match: '>' ,
					state: 'endOpenTag'
				} ,
				{
					match: '/' ,
					state: 'maybeSelfClosingTag'
				}
			]
		} ,
		openTagError: {
			action: [ 'spanStyle' , 'tag' , 'parseError' ] ,
			span: 'tag' ,
			branches: [
				{
					match: '>' ,
					state: 'endOpenTag' ,
					delay: true
				}
			]
		} ,





		closeTag: {
			action: [ 'style' , 'tag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'closeTagName' ,
					propagate: true
				}
			]
		} ,
		closeTagName: {
			action: [ 'style' , 'tagName' ] ,
			span: 'tagName' ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'closeTagName'
				} ,
				{
					state: 'afterCloseTagName' ,
					microState: { closeTag: [ 'span' , 'tagName' ] } ,
					propagate: true
				}
			]
		} ,
		afterCloseTagName: {
			action: [ 'style' , 'tagName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9_-]/ ,
					state: 'closeTagName'
				} ,
				{
					match: '>' ,
					state: 'endCloseTag'
				} ,
				{
					state: 'closeTagError'
				}
			]
		} ,
		endCloseTag: {
			expandSpan: 'tag' ,
			action: [ 'style' , 'tag' ] ,
			return: {
				// if not returning from 'endOpenTag', we've got a parseError
				matchState: 'openTagContent' ,
				matchMicroState: { openTag: [ 'microState' , 'closeTag' ] } ,
				errorAction: [ [ 'spanStyle' , 'tag' , 'parseError' ] , [ 'returnSpanStyle' , 'tag' , 'parseError' ] ] ,
			} ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		closeTagError: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					match: '>' ,
					state: 'endCloseTag'
				}
			]
		} ,





		maybeComment: {
			action: [ 'style' , 'tag' ] ,
			span: 'tag' ,
			branches: [
				{
					// Could be a comments <!-- ... -->
					match: '-' ,
					state: 'maybeComment2'
				} ,
				{
					// Could be a <![CDATA[ ... ]]>
					match: '[' ,
					state: 'maybeCDATA'
				} ,
				{
					// Could be a <!DOCTYPE html>, <!ENTITY ... >, <!ATTLIST ... >,  <!ELEMENT ... >, etc...
					match: /[a-zA-Z0-9_-]/ ,
					action: [ 'spanStyle' , 'tag' , 'definitionTag' ] ,
					state: 'definitionTagName' ,
					propagate: true
				} ,
				{
					state: 'openTagError' ,
					propagate: true
				}
			]
		} ,
		maybeComment2: {
			action: [ 'style' , 'tag' ] ,
			span: 'tag' ,
			branches: [
				{
					match: '-' ,
					action: [ 'spanStyle' , 'tag' , 'comment' ] ,
					state: 'comment' ,
				} ,
				{
					state: 'openTagError' ,
					propagate: true
				}
			]
		} ,
		comment: {
			action: [ 'style' , 'comment' ] ,
			span: 'tag' ,
			branches: [
				{
					match: '-' ,
					state: 'maybeEndComment'
				}
			]
		} ,
		maybeEndComment: {
			action: [ 'style' , 'comment' ] ,
			span: 'tag' ,
			branches: [
				{
					match: '-' ,
					state: 'maybeEndComment2'
				} ,
				{
					state: 'comment' ,
					propagate: true
				}
			]
		} ,
		maybeEndComment2: {
			action: [ 'style' , 'comment' ] ,
			span: 'tag' ,
			branches: [
				{
					match: '>' ,
					state: 'endComment'
				} ,
				{
					match: '-' ,
					state: 'maybeEndComment2'
				} ,
				{
					state: 'comment' ,
					propagate: true
				}
			]
		} ,
		endComment: {
			action: [ 'style' , 'comment' ] ,
			span: 'tag' ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,





		maybeCDATA: {
			action: [ 'style' , 'tag' ] ,
			span: [ 'tag' , 'CDATAMark' ] ,
			branches: [
				{
					match: /[CDAT[]/ ,
					state: 'maybeCDATA' ,
				} ,
				{
					state: 'openTagError' ,
					propagate: true ,
					
					branchOn: 'CDATAMark' ,
					spanBranches: [
						{
							match: '[CDATA[' ,
							state: 'CDATA'
						}
					]
				}
			]
		} ,
		CDATA: {
			action: [ 'style' , 'cdata' ] ,
			branches: [
				{
					match: ']' ,
					state: 'maybeEndCDATA'
				}
			]
		} ,
		maybeEndCDATA: {
			action: [ 'style' , 'cdata' ] ,
			span: 'closeCDATA' ,
			branches: [
				{
					match: ']' ,
					state: 'maybeEndCDATA2'
				} ,
				{
					state: 'CDATA' ,
					propagate: true
				}
			]
		} ,
		maybeEndCDATA2: {
			action: [ 'style' , 'cdata' ] ,
			span: [ 'closeCDATA' , 'closeCDATA2' ] ,
			branches: [
				{
					match: '>' ,
					state: 'endCDATA'
				} ,
				{
					match: ']' ,
					state: 'maybeEndCDATA2' ,
					copySpan: [ 'closeCDATA2' , 'closeCDATA' ]
				} ,
				{
					state: 'CDATA' ,
					propagate: true
				}
			]
		} ,
		endCDATA: {
			action: [ 'spanStyle' , 'closeCDATA' , 'tag' ] ,
			span: 'closeCDATA' ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,





		// Declaration: <? ... ?>
		declarationTag: {
			action: [ 'style' , 'declarationTag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'declarationTagName' ,
					propagate: true
				}
			]
		} ,
		maybeEndDeclarationTag: {
			action: [ 'style' , 'declarationTag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '>' ,
					state: 'endDeclarationTag' ,
				} ,
				{
					state: 'declarationTagAttributesPart' ,
					propagate: true
				}
			]
		} ,
		endDeclarationTag: {
			action: [ 'style' , 'declarationTag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		declarationTagName: {
			action: [ 'style' , 'declarationTagName' ] ,
			span: 'tagName' ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'declarationTagName'
				} ,
				{
					state: 'afterDeclarationTagName' ,
					propagate: true
				}
			]
		} ,
		afterDeclarationTagName: {
			action: [ 'style' , 'declarationTagName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '?' ,
					state: 'maybeEndDeclarationTag'
				} ,
				{
					match: /[ \t\n]/ ,
					state: 'declarationTagAttributesPart'
				} ,
				{
					state: 'declarationTagError'
				}
			]
		} ,
		declarationTagAttributesPart: {
			action: [ 'style' , 'declarationTagName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'declarationTagAttributeName' ,
					propagate: true
				} ,
				{
					match: '?' ,
					state: 'maybeEndDeclarationTag'
				}
			]
		} ,
		declarationTagAttributeName: {
			action: [ 'style' , 'declarationTagAttributeName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'declarationTagAttributeName'
				} ,
				{
					match: '?' ,
					state: 'maybeEndDeclarationTag'
				} ,
				{
					match: '=' ,
					state: 'declarationTagAttributeEqual'
				}
			]
		} ,
		declarationTagAttributeEqual: {
			action: [ 'style' , 'operator' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'declarationTagAttributeValue' ,
					propagate: true
				}
			]
		} ,
		declarationTagAttributeValue: {
			action: [ 'style' , 'string' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '"' ,
					subState: 'doubleQuoteAttributeValue' ,
					state: 'declarationTagAttributesPart'
				} ,
				{
					match: '?' ,
					state: 'maybeEndDeclarationTag'
				}
			]
		} ,
		declarationTagError: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					match: '?' ,
					state: 'maybeEndDeclarationTag'
				}
			]
		} ,




		// Definition: <! ... >
		// Can be nested: <!DOCTYPE mydoctype [ <!ELEMENT ... > ]>
		definitionTag: {
			action: [ 'style' , 'definitionTag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'definitionTagName' ,
					propagate: true
				}
			]
		} ,
		endDefinitionTag: {
			action: [ 'style' , 'definitionTag' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		definitionTagName: {
			action: [ 'style' , 'definitionTagName' ] ,
			span: 'tagName' ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'definitionTagName'
				} ,
				{
					state: 'afterDefinitionTagName' ,
					propagate: true
				}
			]
		} ,
		afterDefinitionTagName: {
			action: [ 'style' , 'definitionTagName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '>' ,
					state: 'endDefinitionTag'
				} ,
				{
					match: /[ \t\n]/ ,
					state: 'definitionTagAttributesPart'
				} ,
				{
					match: '[' ,
					subState: 'openNestedDefinitionTag'
				} ,
				{
					state: 'definitionTagError'
				}
			]
		} ,
		definitionTagAttributesPart: {
			action: [ 'style' , 'definitionTagName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'definitionTagAttributeName' ,
					propagate: true
				} ,
				{
					match: '[' ,
					subState: 'openNestedDefinitionTag'
				} ,
				{
					match: '>' ,
					state: 'endDefinitionTag'
				}
			]
		} ,
		definitionTagAttributeName: {
			action: [ 'style' , 'definitionTagAttributeName' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: /[a-zA-Z0-9:_-]/ ,
					state: 'definitionTagAttributeName'
				} ,
				{
					match: /[ \t\n]/ ,
					state: 'definitionTagAttributesPart'
				} ,
				{
					match: '>' ,
					state: 'endDefinitionTag'
				} ,
				{
					match: '=' ,
					state: 'definitionTagAttributeEqual'
				}
			]
		} ,
		definitionTagAttributeEqual: {
			action: [ 'style' , 'operator' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					state: 'definitionTagAttributeValue' ,
					propagate: true
				}
			]
		} ,
		definitionTagAttributeValue: {
			action: [ 'style' , 'string' ] ,
			expandSpan: 'tag' ,
			branches: [
				{
					match: '"' ,
					subState: 'doubleQuoteAttributeValue' ,
					state: 'definitionTagAttributesPart'
				} ,
				{
					match: '>' ,
					state: 'endDefinitionTag'
				}
			]
		} ,
		openNestedDefinitionTag: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					microState: { nestedDefinitionTag: true } ,
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		closeNestedDefinitionTag: {
			action: [ [ 'style' , 'definitionTagBracket' ] , [ 'openerStyle' , 'definitionTagBracket' ] ] ,
			return: {
				matchState: 'openNestedDefinitionTag' ,
				errorAction: [ 'style' , 'parseError' ]
			} ,
			branches: [
				{
					state: 'definitionTagError' ,
					propagate: true
				}
			]
		} ,
		definitionTagError: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					match: '>' ,
					state: 'endDefinitionTag'
				}
			]
		} ,






		doubleQuoteAttributeValue: {
			action: [ 'style' , 'string' ] ,
			branches: [
				{
					match: '\\' ,
					subState: 'escape'
				} ,
				{
					match: '"' ,
					return: true ,
					delay: true
				}
			]
		} ,





		escape: {
			action: [ 'style' , 'escape' ] ,
			branches: [
				{
					return: true ,
					state: 'idle' ,		// This is ignored if the current state can return
					delay: true
				}
			]
		}
	}
} ;



module.exports = prog ;

