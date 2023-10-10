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



/* Javascript syntax highlighter */






const keywords = [
	'var' , 'let' , 'const' ,
	'do' , 'while' , 'for' , 'in' , 'of' , 'switch' , 'case' , 'default' , 'break' , 'continue' ,
	'if' , 'else' ,
	'function' , 'arguments' , 'async' , 'await' , 'return' , 'yield' ,
	'throw' , 'try' , 'catch' , 'finally' ,
	'new' , 'class' , 'extends' , 'static' , 'public' , 'protected' , 'private' , 'implements' , 'interface' , 'super' ,
	
	'typeof' , 'instanceof' ,
	'delete' ,
	'enum' , 'eval' , 'void' , 'with' , 
	
	'export' , 'import' , 'from' , 'package' , 
	'debugger' ,
] ;

const operators = [
	'+' , '++' , '-' , '--' , '*' , '**' , '%' , // '/'
	'&&' , '||' , '!' , '!!' ,
	'==' , '===' , '!=' , '!==' , '<' , '<=' , '>' , '>=' ,
	'&' , '|' , '^' , '<<' , '>>' , '>>>' ,
	'??'
] ;

const assignments = [
	'=' ,
	'+=' , '-=' , '*=' , '%=' , // '/='
	'&=' , '|=' , '^='
] ;

const constantKeywords = [
	'true' , 'false' , 'null' , 'undefined' , 'Infinity' , 'NaN' ,

	// Node pseudo-constant
	'__filename' , '__dirname'
] ;

const coreMethods = [
	'setTimeout' , 'clearTimeout' , 'setInterval' , 'clearInterval' , 'setImmediate' , 'clearImmediate' ,
	'isNaN' , 'isFinite' , 'parseInt' , 'parseFloat' ,

	// Node
	'unref' , 'ref' , 'require'
] ;

const coreClassesOrObjects = [
	'Array' , 'Boolean' , 'Date' , 'Error' , 'Function' , 'Intl' , 'Math' , 'Number' , 'Object' , 'String' , 'RegExp' ,
	'EvalError' , 'RangeError' , 'ReferenceError' , 'SyntaxError' , 'TypeError' ,
	'ArrayBuffer' , 'Float32Array' , 'Float64Array' , 'Int16Array' , 'Int32Array' ,
	'Int8Array' , 'Uint16Array' , 'Uint32Array' , 'Uint8Array' ,

	// Common
	'console' , 'JSON' , 'Promise' ,

	// Node
	'exports' , 'global' , 'module' ,
	'process' , 'Buffer' ,

	// Browser
	'window' , 'document' , 'Window' , 'Image' , 'DataView' , 'URIError'
] ;

const specialMember = [
	'prototype' , 'constructor'
] ;



const coreMethodHints = {
	setTimeout: 'timerID = setTimeout( callback , ms )' ,
	clearTimeout: 'clearTimeout( timerID )' ,
	setInterval: 'timerID = setInterval( callback , ms )' ,
	clearInterval: 'clearInterval( timerID )' ,
	parseInt: 'number = parseInt( string , radix )'
} ;





const prog = {
	hostConfig: {	// Accessible by the host
	} ,
	config: {
		initState: 'idle'
	} ,
	styles: {
		idle: { color: 'white' } ,
		keyword: { color: 'brightWhite' , bold: true } ,
		operator: { color: 'brightWhite' , bold: true } ,
		assignment: { color: 'brightWhite' , bold: true } ,
		this: { color: 'brightRed' , bold: true } ,
		constantKeyword: { color: 'brightBlue' , bold: true } ,
		constant: { color: 'brightBlue' } ,
		identifier: { color: 'red' } ,
		number: { color: 'cyan' } ,
		string: { color: 'blue' } ,
		escape: { color: 'brightCyan' , bold: true } ,
		templatePlaceholder: { color: 'brightCyan' , bold: true } ,
		comment: { color: 'gray' } ,
		property: { color: 'green' } ,
		method: { color: 'brightYellow' } ,
		coreMethod: { color: 'brightYellow' , bold: true } ,
		class: { color: 'magenta' } ,
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

		parseError: { color: 'brightWhite' , bgColor: 'red' , bold: true } ,
		brace: { color: 'brightWhite' , bold: true }
	} ,
	states: {
		idle: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: /[a-zA-Z_$]/ ,
					state: 'identifier'
				} ,
				{
					match: /[=.<>^?!&|~*%+-]/ ,
					state: 'operator'
				} ,
				{
					match: /[0-9]/ ,
					state: 'number'
				} ,
				{
					match: "'" ,
					state: 'singleQuoteString'
				} ,
				{
					match: '"' ,
					state: 'doubleQuoteString'
				} ,
				{
					match: '`' ,
					state: 'templateString'
				} ,
				{
					match: '/' ,
					state: 'idleSlash'
				} ,
				{
					match: '{' ,
					subState: 'openBrace'
				} ,
				{
					match: '}' ,
					state: 'closeBrace'
				} ,
				{
					match: '[' ,
					subState: 'openBracket'
				} ,
				{
					match: ']' ,
					state: 'closeBracket'
				} ,
				{
					match: '(' ,
					subState: 'openParenthesis'
				} ,
				{
					match: ')' ,
					state: 'closeParenthesis'
				} ,
				{
					match: ':' ,
					state: 'colon' ,
				}
			]
		} ,
		// In the middle of an expression, after any constant/value/identifier/function call/etc...
		// Mostly like idle, except that slash can be divide sign instead of RegExp
		idleAfterValue: {
			action: [ 'style' , 'idle' ] ,	// action when this state is active at the end of the event
			branches: [
				{
					match: '/' ,
					state: 'idleAfterValueSlash'
				} ,
				{
					match: ' ' ,
					state: 'idleAfterValue'
				} ,
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		number: {
			action: [ 'style' , 'number' ] ,
			branches: [
				{
					match: /[0-9.]/ ,
					state: 'number'
				} ,
				{
					state: 'idleAfterValue' ,
					propagate: true
				}
			]
		} ,
		identifier: {
			action: [ 'style' , 'identifier' ] ,
			span: 'identifier' ,
			branches: [
				{
					match: /[a-zA-Z0-9_$]/ ,
					state: 'identifier'
				} ,
				{
					store: [ 'autoCompletion' , [ 'span' , 'identifier' ] ] ,
					state: 'afterIdentifier' ,
					propagate: true ,

					branchOn: 'identifier' ,
					spanBranches: [
						{
							match: 'this' ,
							action: [ 'spanStyle' , 'identifier' , 'this' ] ,
							state: 'afterIdentifier' ,
							propagate: true
						} ,
						{
							match: keywords ,
							action: [ 'spanStyle' , 'identifier' , 'keyword' ] ,
							state: 'idle' ,
							propagate: true
						} ,
						{
							match: constantKeywords ,
							action: [ 'spanStyle' , 'identifier' , 'constantKeyword' ] ,
							state: 'idleAfterValue' ,
							propagate: true
						} ,
						{
							match: coreMethods ,
							action: [ [ 'spanStyle' , 'identifier' , 'coreMethod' ] , [ 'hint' , coreMethodHints ] ] ,
							store: [ 'autoCompletion' , [ 'span' , 'identifier' ] ] ,
							state: 'idle' ,
							propagate: true
						} ,
						{
							match: coreClassesOrObjects ,
							action: [ 'spanStyle' , 'identifier' , 'coreClassOrObject' ] ,
							store: [ 'autoCompletion' , [ 'span' , 'identifier' ] ] ,
							state: 'afterIdentifier' ,
							propagate: true
						} ,
						{
							match: /^[A-Z][A-Z0-9_]+$/ ,
							action: [ 'spanStyle' , 'identifier' , 'constant' ] ,
							store: [ 'autoCompletion' , [ 'span' , 'identifier' ] ] ,
							state: 'afterIdentifier' ,
							propagate: true
						} ,
						{
							match: /^[A-Z]/ ,
							action: [ 'spanStyle' , 'identifier' , 'class' ] ,
							store: [ 'autoCompletion' , [ 'span' , 'identifier' ] ] ,
							state: 'afterClass' ,
							propagate: true
						}
					]
				}
			]
		} ,
		afterIdentifier: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: ' ' ,
					state: 'afterIdentifier'
				} ,
				{
					match: '.' ,
					state: 'dotAfterIdentifier'
				} ,
				{
					match: ':' ,
					matchMicroState: 'ternary' ,
					state: 'colon'
				} ,
				{
					match: ':' ,
					action: [ 'spanStyle' , 'identifier' , 'property' ] ,
					state: 'colon'
				} ,
				{
					match: '(' ,
					subState: 'openParenthesis' ,
					action: [ 'spanStyle' , 'identifier' , 'method' ]
				} ,
				{
					state: 'idleAfterValue' ,
					propagate: true
				}
			]
		} ,
		afterClass: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: ' ' ,
					state: 'afterClass'
				} ,
				{
					match: '(' ,
					subState: 'openParenthesis' ,
					action: [ 'spanStyle' , 'identifier' , 'constructor' ]
				} ,
				{
					// Fallback to other afterIdentifier branches
					state: 'afterIdentifier' ,
					propagate: true
				}
			]
		} ,
		dotAfterIdentifier: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: ' ' ,
					state: 'dotAfterIdentifier'
				} ,
				{
					match: /[a-zA-Z_$]/ ,
					state: 'member'
				} ,
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		member: {
			action: [ 'style' , 'property' ] ,
			span: 'identifier' ,
			branches: [
				{
					match: /[a-zA-Z0-9_$]/ ,
					state: 'member'
				} ,
				{
					store: [ 'autoCompletion' , [ 'span' , 'identifier' ] ] ,
					state: 'afterIdentifier' ,
					propagate: true ,

					branchOn: 'identifier' ,
					spanBranches: [
						{
							match: specialMember ,
							action: [ 'spanStyle' , 'identifier' , 'keyword' ] ,
							state: 'afterIdentifier' ,
							propagate: true
						}
					]
				}
			]
		} ,



		operator: {
			action: [ 'style' , 'idle' ] ,
			span: 'operator' ,
			branches: [
				{
					match: /[=.<>^?!&|~*%+-]/ ,
					state: 'operator'
				} ,
				{
					state: 'idle' ,
					propagate: true ,

					branchOn: 'operator' ,
					spanBranches: [
						{
							match: '?' ,
							action: [ 'spanStyle' , 'operator' , 'operator' ] ,
							state: 'idle' ,
							microState: { ternary: true } ,
							propagate: true
						} ,
						{
							match: operators ,
							action: [ 'spanStyle' , 'operator' , 'operator' ] ,
							state: 'idle' ,
							propagate: true
						} ,
						{
							match: assignments ,
							action: [ 'spanStyle' , 'operator' , 'assignment' ] ,
							state: 'idle' ,
							propagate: true
						}
					]
				}
			]
		} ,
		colon: {
			action: [ 'style' , 'operator' ] ,
			microState: { ternary: false } ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,






		singleQuoteString: {
			action: [ 'style' , 'string' ] ,
			branches: [
				{
					match: '\\' ,
					subState: 'escape'
				} ,
				{
					match: /['\n]/ ,
					state: 'idleAfterValue' ,
					delay: true
				}
			]
		} ,
		doubleQuoteString: {
			action: [ 'style' , 'string' ] ,
			branches: [
				{
					match: '\\' ,
					subState: 'escape'
				} ,
				{
					match: /["\n]/ ,
					state: 'idleAfterValue' ,
					delay: true
				}
			]
		} ,
		templateString: {
			action: [ 'style' , 'string' ] ,
			branches: [
				{
					match: '\\' ,
					subState: 'escape'
				} ,
				{
					match: '`' ,
					state: 'idleAfterValue' ,
					delay: true
				} ,
				{
					match: '$' ,
					state: 'templatePlaceholder'
				}
			]
		} ,
		templatePlaceholder: {
			startSpan: true ,
			action: [ 'style' , 'templatePlaceholder' ] ,
			branches: [
				{
					match: '{' ,
					subState: 'openBrace' ,
					state: 'templateString'
				} ,
				{
					action: [ 'spanStyle' , 'string' ] ,
					//clearSpan: true ,
					state: 'templateString'
				}
			]
		} ,
		regexp: {
			action: [ 'style' , 'regexp' ] ,
			branches: [
				{
					match: '\\' ,
					subState: 'escape'
				} ,
				{
					match: /[.?+*^$]/ ,
					state: 'regexpMarkup'
				} ,
				{
					match: '[' ,
					state: 'regexpOpenBracket'
				} ,
				{
					match: '(' ,
					subState: 'regexpOpenParenthesis'
				} ,
				{
					match: ')' ,
					state: 'regexpCloseParenthesis'
				} ,
				{
					match: '|' ,
					state: 'regexpAlternative'
				} ,
				{
					match: '/' ,
					state: 'closeRegexp'
				}
			]
		} ,
		closeRegexp: {
			action: [ 'style' , 'regexpDelemiter' ] ,
			branches: [
				{
					state: 'regexpFlag' ,
					propagate: true
				}
			]
		} ,
		regexpFlag: {
			action: [ 'style' , 'regexpFlag' ] ,
			branches: [
				{
					match: /[a-z]/ ,
					state: 'regexpFlag'
				} ,
				{
					state: 'idleAfterValue' ,
					propagate: true
				}
			]
		} ,
		regexpMarkup: {
			action: [ 'style' , 'regexpMarkup' ] ,
			branches: [
				{
					state: 'regexp' ,
					propagate: true
				}
			]
		} ,
		regexpAlternative: {
			action: [ 'style' , 'regexpAlternative' ] ,
			branches: [
				{
					state: 'regexp' ,
					propagate: true
				}
			]
		} ,
		regexpOpenParenthesis: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					state: 'regexp' ,
					propagate: true
				}
			]
		} ,
		regexpCloseParenthesis: {
			action: [ [ 'style' , 'regexpParenthesis' ] , [ 'openerStyle' , 'regexpParenthesis' ] ] ,
			return: {
				matchState: 'regexpOpenParenthesis' ,
				errorAction: [ 'style' , 'parseError' ]
			} ,
			branches: [
				{
					state: 'regexp' ,
					propagate: true
				}
			]
		} ,
		regexpOpenBracket: {
			action: [ 'style' , 'regexpBracket' ] ,
			branches: [
				{
					state: 'regexpClass' ,
					propagate: true
				}
			]
		} ,
		regexpClass: {
			action: [ 'style' , 'regexpClass' ] ,
			branches: [
				{
					match: '\\' ,
					subState: 'escape'
				} ,
				{
					match: '-' ,
					state: 'regexpMaybeClassRange'
				} ,
				{
					match: ']' ,
					state: 'regexpCloseBracket'
				}
			]
		} ,
		regexpMaybeClassRange: {
			action: [ 'style' , 'regexpClass' ] ,
			branches: [
				{
					match: ']' ,
					state: 'regexpCloseBracket'
				} ,
				{
					action: [ 'starterStyle' , 'regexpClassRange' ] ,
					state: 'regexpClass'
				}
			]
		} ,
		regexpCloseBracket: {
			action: [ 'style' , 'regexpBracket' ] ,
			branches: [
				{
					state: 'regexp' ,
					propagate: true
				}
			]
		} ,



		openBrace: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		closeBrace: {
			action: [ [ 'style' , 'brace' ] , [ 'openerStyle' , 'brace' ] ] ,
			return: {
				matchState: 'openBrace' ,
				errorAction: [ 'style' , 'parseError' ]
			} ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		openBracket: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		closeBracket: {
			action: [ [ 'style' , 'brace' ] , [ 'openerStyle' , 'brace' ] ] ,
			return: {
				matchState: 'openBracket' ,
				errorAction: [ 'style' , 'parseError' ]
			} ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		openParenthesis: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,
		closeParenthesis: {
			action: [ [ 'style' , 'brace' ] , [ 'openerStyle' , 'brace' ] ] ,
			return: {
				matchState: 'openParenthesis' ,
				errorAction: [ 'style' , 'parseError' ]
			} ,
			branches: [
				{
					state: 'idle' ,
					propagate: true
				}
			]
		} ,



		idleSlash: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '/' ,
					state: 'lineComment' ,
					action: [ 'streakStyle' , 'comment' ]
				} ,
				{
					match: '*' ,
					state: 'multiLineComment' ,
					action: [ 'streakStyle' , 'comment' ]
				} ,
				{
					state: 'regexp' ,
					propagate: true ,
					action: [ 'streakStyle' , 'regexpDelemiter' ]
				}
			]
		} ,
		idleAfterValueSlash: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: '/' ,
					state: 'lineComment' ,
					action: [ 'streakStyle' , 'comment' ]
				} ,
				{
					match: '*' ,
					state: 'multiLineComment' ,
					action: [ 'streakStyle' , 'comment' ]
				} ,
				{
					state: 'idle'
				}
			]
		} ,
		lineComment: {
			action: [ 'style' , 'comment' ] ,
			branches: [
				{
					match: '\n' ,
					state: 'idle'
				}
			]
		} ,
		multiLineComment: {
			action: [ 'style' , 'comment' ] ,
			branches: [
				{
					match: '*' ,
					state: 'multiLineCommentAsterisk'
				}
			]
		} ,
		multiLineCommentAsterisk: {
			action: [ 'style' , 'comment' ] ,
			branches: [
				{
					match: '/' ,
					state: 'idle' ,
					delay: true
				} ,
				{
					state: 'multiLineComment' ,
					propagate: true
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

