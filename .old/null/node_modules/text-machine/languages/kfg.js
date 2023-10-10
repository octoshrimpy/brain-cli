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



			/* KFG (Kung-Fig) */






const constantKeywords = [
	'null' ,
	'true' , 'false' , 'on' , 'off' , 'yes' , 'no' ,
	'NaN' , 'Infinity' , '-Infinity'
] ;



const prog = {
	hostConfig: {	// Accessible by the host
	} ,
	config: {
		initState: 'idle'
	} ,
	styles: {
		idle: { color: 'white' } ,

		operator: { color: 'brightWhite' , bold: true } ,
		repetition: { color: 'brightYellow' } ,
		property: { color: 'green' } ,

		constantKeyword: { color: 'brightBlue' , bold: true } ,

		kfgOperatorMark: { color: 'brightRed' } ,
		kfgOperator: { color: 'red' } ,
		classMark: { color: 'brightMagenta' } ,
		class: { color: 'magenta' } ,

		number: { color: 'cyan' } ,
		string: { color: 'blue' } ,

		comment: { color: 'gray' } ,



		keyword: { color: 'brightWhite' , bold: true } ,
		assignment: { color: 'brightWhite' , bold: true } ,
		constant: { color: 'brightBlue' } ,
		identifier: { color: 'red' } ,
		escape: { color: 'brightCyan' , bold: true } ,
		templatePlaceholder: { color: 'brightCyan' , bold: true } ,
		method: { color: 'brightYellow' } ,
		coreMethod: { color: 'brightYellow' , bold: true } ,
		constructor: { color: 'magenta' } ,
		coreClassOrObject: { color: 'brightMagenta' , bold: true } ,

		regexp: { color: 'blue' } ,
		regexpDelemiter: { color: 'brightMagenta' , bold: true } ,
		regexpParenthesis: { color: 'yellow' , bold: true } ,
		regexpBracket: { color: 'brightMagenta' , bold: true } ,
		regexpAlternative: { color: 'yellow' , bold: true } ,
		regexpMarkup: { color: 'brightMagenta' } ,
		regexpClass: { color: 'cyan' } ,
		regexpClassRange: { color: 'magenta' } ,
		regexpFlag: { color: 'green' } ,

		brace: { color: 'brightWhite' , bold: true }  ,

		parseError: { color: 'brightWhite' , bgColor: 'red' , bold: true } ,
		unexistantState: { color: 'brightWhite' , bgColor: 'magenta' , bold: true }
	} ,
	devMode: {
		// Should be removed when dev is finished
		fallbackState: 'unexistantState'
	} ,
	states: {
		unexistantState: {
			// This is a dev state, to be removed...
			action: [ 'style' , 'unexistantState' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				}
			]
		} ,
		idle: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: /[ \t\n]/ ,
					state: 'idle'
				} ,
				{
					match: '#' ,
					state: 'comment'
				} ,
				{
					match: '(' ,
					state: 'openOperator'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '-' ,
					state: 'item'
				} ,
				{
					match: '[' ,
					state: 'openTag'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '<' ,
					state: 'maybeClassOrMapKey'
				} ,
				{
					match: ':' ,
					action: [ 'style' , 'operator' ] ,
					state: 'maybeMapValue' ,
					transition: true
				} ,
				{
					match: '"' ,
					state: 'maybeValueOrDoubleQuotedKey'
				} ,
				{
					state: 'maybeValueOrKey'
				}
			]
		} ,



		comment: {
			action: [ 'style' , 'comment' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				}
			]
		} ,



		maybeValueOrKey: {
			action: [ 'style' , 'idle' ] ,
			span: 'maybeValueOrKey' ,
			branches: [
				{
					match: /[a-zA-Z-]/ ,
					state: 'maybeValueOrKey'
				} ,
				{
					match: ':' ,
					action: [ [ 'style' , 'operator' ] , [ 'spanStyle' , 'maybeValueOrKey' , 'property' ] ] ,
					state: 'afterKey' ,
					transition: true
				} ,
				{
					match: '\n' ,
					state: 'idle' ,
					
					branchOn: 'maybeValueOrKey' ,
                    spanBranches: [
                    	{
							match: constantKeywords ,
							action: [ 'spanStyle' , 'maybeValueOrKey' , 'constantKeyword' ] ,
							state: 'idle'
						}
                    ]
				} ,
				{
					state: 'maybeValueOrKeyNotConstant'
				}
			]
		} ,
		maybeValueOrKeyNotConstant: {
			span: 'maybeValueOrKey' ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ':' ,
					action: [ [ 'style' , 'operator' ] , [ 'spanStyle' , 'maybeValueOrKey' , 'property' ] ] ,
					state: 'afterKey' ,
					transition: true
				}
			]
		} ,
		afterKey: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterKey'
				} ,
				{
					match: '(' ,
					state: 'openOperator'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '<' ,
					state: 'openClass'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '"' ,
					state: 'doubleQuotedValue'
				} ,
				{
					state: 'unquotedValue' ,
					propagate: true
				}
			]
		} ,



		item: {
			action: [ 'style' , 'operator' ] ,
			span: 'itemMark' ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: '\t' ,
					state: 'compactList'
				} ,
				{
					match: ' ' ,
					state: 'afterItem'
				} ,
				{
					match: '-' ,
					state: 'maybeSection'
				} ,
				{
					match: /[0-9]/ ,
					state: 'itemRepetition'
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		itemRepetition: {
			action: [ 'style' , 'repetition' ] ,
			span: 'itemMark' ,
			branches: [
				{
					match: '\n' ,
					action: [ 'spanStyle' , 'itemMark' , 'parseError' ] ,
					state: 'idle'
				} ,
				{
					match: /[0-9]/ ,
					state: 'itemRepetition'
				} ,
				{
					match: 'x' ,
					action: [ 'style' , 'repetition' ] ,
					state: 'afterItemRepetition' ,
					delay: true
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		afterItem: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterItem'
				} ,
				{
					match: '\t' ,
					state: 'compactList'
				} ,
				{
					match: '(' ,
					state: 'openOperator'
				} ,
				{
					match: '<' ,
					state: 'openClass'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '"' ,
					state: 'doubleQuotedValue'
				} ,
				{
					state: 'unquotedValue' ,
					propagate: true
				}
			]
		} ,
		afterItemRepetition: {
			// Same than 'afterItem', but without compact-list
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterItemRepetition'
				} ,
				{
					match: '(' ,
					state: 'openOperator'
				} ,
				{
					match: '<' ,
					state: 'openClass'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '"' ,
					state: 'doubleQuotedValue'
				} ,
				{
					state: 'unquotedValue' ,
					propagate: true
				}
			]
		} ,
		compactList: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterItem'
				} ,
				{
					match: '\t' ,
					state: 'lineError'
				} ,
				{
					match: '(' ,
					state: 'openOperator'
				} ,
				{
					match: '-' ,
					state: 'item'
				} ,
				{
					match: '<' ,
					state: 'openClass'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '"' ,
					state: 'doubleQuotedValue'
				} ,
				{
					state: 'maybeValueOrKey'
				}
			]
		} ,
		
		
		
		openOperator: {
			action: [ 'style' , 'kfgOperatorMark' ] ,
			span: 'operator' ,
			branches: [
				{
					match: '\n' ,
					action: [ 'spanStyle' , 'operator' , 'parseError' ] ,
					state: 'idle'
				} ,
				{
					match: ')' ,
					state: 'lineError'
				} ,
				{
					state: 'operator'
				}
			]
		} ,
		operator: {
			action: [ 'style' , 'kfgOperator' ] ,
			span: 'operator' ,
			branches: [
				{
					match: '\n' ,
					action: [ 'spanStyle' , 'operator' , 'parseError' ] ,
					state: 'idle'
				} ,
				{
					match: ')' ,
					state: 'closeOperator' ,
				}
			]
		} ,
		closeOperator: {
			action: [ 'style' , 'kfgOperatorMark' ] ,
			span: 'operator' ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterOperator' ,
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		afterOperator: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterOperator'
				} ,
				{
					match: '<' ,
					state: 'openClass'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '"' ,
					state: 'doubleQuotedValue'
				} ,
				{
					state: 'unquotedValue' ,
					propagate: true
				}
			]
		} ,



		openClass: {
			action: [ 'style' , 'classMark' ] ,
			span: 'class' ,
			branches: [
				{
					match: '\n' ,
					action: [ 'spanStyle' , 'class' , 'parseError' ] ,
					state: 'idle'
				} ,
				{
					match: '>' ,
					state: 'lineError'
				} ,
				{
					state: 'class'
				}
			]
		} ,
		class: {
			action: [ 'style' , 'class' ] ,
			span: 'class' ,
			branches: [
				{
					match: '\n' ,
					action: [ 'spanStyle' , 'class' , 'parseError' ] ,
					state: 'idle'
				} ,
				{
					match: '>' ,
					state: 'closeClass'
				}
			]
		} ,
		closeClass: {
			action: [ 'style' , 'classMark' ] ,
			span: 'class' ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterClass' ,
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		afterClass: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					match: ' ' ,
					state: 'afterClass'
				} ,
				{
					match: '>' ,
					state: 'stringIntroducer'
				} ,
				{
					match: '$' ,
					state: 'maybeTemplate'
				} ,
				{
					match: '@' ,
					state: 'includeMark'
				} ,
				{
					match: '"' ,
					state: 'doubleQuotedValue'
				} ,
				{
					state: 'unquotedValue' ,
					propagate: true
				}
			]
		} ,



		unquotedValue: {
			action: [ 'style' , 'string' ] ,
			span: 'unquotedValue' ,
			branches: [
				{
					// Could be a negative number or -Infinity
					match: '-' ,
					state: 'unquotedMinusValue'
				} ,
				{
					match: /[a-zA-Z]/ ,
					state: 'unquotedStringOrConstant'
				} ,
				{
					match: /[0-9]/ ,
					action: [ 'spanStyle' , 'unquotedValue' , 'number' ] ,
					state: 'number' ,
				} ,
				{
					state: 'unquotedString' ,
				}
			]
		} ,
		unquotedMinusValue: {
			action: [ 'style' , 'string' ] ,
			span: 'unquotedValue' ,
			branches: [
				{
					match: /[a-zA-Z]/ ,
					state: 'unquotedStringOrConstant'
				} ,
				{
					match: /[0-9]/ ,
					action: [ 'spanStyle' , 'unquotedValue' , 'number' ] ,
					state: 'number' ,
				} ,
				{
					state: 'unquotedString' ,
				}
			]
		} ,
		unquotedStringOrConstant: {
			action: [ 'style' , 'string' ] ,
			span: 'unquotedValue' ,
			branches: [
				{
					match: /[a-zA-Z]/ ,
					state: 'unquotedStringOrConstant'
				} ,
				{
					match: '\n' ,
					state: 'idle' ,
					
					branchOn: 'unquotedValue' ,
					spanBranches: [
                    	{
							match: constantKeywords ,
							action: [ 'spanStyle' , 'unquotedValue' , 'constantKeyword' ]
						}
					]
				} ,
				{
					state: 'unquotedString'
				}
			]
		} ,
		unquotedString: {
			action: [ 'style' , 'string' ] ,
			span: 'unquotedValue' ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				}
			]
		} ,
		number: {
			action: [ 'style' , 'number' ] ,
			span: 'unquotedValue' ,
			branches: [
				{
					match: /[0-9eE]/ ,
					state: 'number'
				} ,
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					state: 'lineError'
				}
			]
		} ,



		stringIntroducer: {
			action: [ 'style' , 'operator' ] ,
			branches: [
				{
					match: '>' ,
					state: 'stringFoldedIntroducer'
				} ,
				{
					match: ' ' ,
					state: 'introducedString' ,
					transition: true
				} ,
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		stringFoldedIntroducer: {
			action: [ 'style' , 'operator' ] ,
			branches: [
				{
					match: ' ' ,
					state: 'introducedString' ,
					transition: true
				} ,
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		introducedString: {
			action: [ 'style' , 'string' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				}
			]
		} ,



		/*
			MISSING from JOE state-machine:

			*section* *tag* *map* *include* *include* *ref* *expression*
			*template* *introduced*template* *doublequote*key* *doublequote*string* *doublequote*template*
			hexadecimal numbers
			
			MISSING (other):
			Inline LXON
		*/



		escape: {
			action: [ 'style' , 'escape' ] ,
			branches: [
				{
					return: true ,
					state: 'idle' ,		// This is ignored if the current state can return
					delay: true
				}
			]
		} ,
		
		
		
		endOfLine: {
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				} ,
				{
					state: 'lineError'
				}
			]
		} ,
		lineError: {
			// This is a bad line, styled with parseError until the end of it
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				}
			]
		}
	}
} ;



module.exports = prog ;

