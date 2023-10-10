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



/* A CSS parser */



const prog = {
	hostConfig: {	// Accessible by the host
	} ,
	config: {
		initState: 'idle'
	} ,
	styles: {
		idle: { color: 'white' } ,
		operator: { color: 'brightWhite' , bold: true } ,

		selector: { color: 'brightMagenta' , bold: true } ,

		number: { color: 'cyan' } ,
		entity: { color: 'cyan' } ,
		string: { color: 'blue' } ,
		escape: { color: 'brightCyan' , bold: true } ,

		comment: { color: 'gray' } ,
		property: { color: 'green' } ,

		parseError: { color: 'brightWhite' , bgColor: 'red' , bold: true }
	} ,
	states: {
		idle: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: /[#.[\]=a-zA-Z0-9:_-]/ ,
					state: 'selector' ,
					propagate: true
				} ,
				{
					match: /[ \t\n]/ ,
					state: 'idle'
				}
			]
		} ,
		selector: {
			action: [ 'style' , 'selector' ] ,
			branches: [
				{
					match: /[#.[\]=a-zA-Z0-9:_ \t\n-]/ ,
					state: 'selector' ,
				} ,
				{
					match: '{' ,
					state: 'declarationIdle'
				} ,
				{
					action: [ 'style' , 'parseError' ] ,
					state: 'idle'
				}
			]
		} ,



		declarationIdle: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: /[a-zA-Z0-9-]/ ,
					state: 'declarationProperty' ,
					propagate: true
				} ,
				{
					match: '}' ,
					state: 'idle'
				} ,
				{
					match: /[ \t\n]/ ,
					state: 'declarationIdle'
				} ,
				{
					state: 'declarationError'
				}
			]
		} ,
		declarationProperty: {
			action: [ 'style' , 'property' ] ,
			branches: [
				{
					match: /[a-zA-Z0-9-]/ ,
					state: 'declarationProperty' ,
				} ,
				{
					state: 'declarationAfterProperty' ,
					propagate: true
				}
			]
		} ,
		declarationAfterProperty: {
			action: [ 'style' , 'idle' ] ,
			branches: [
				{
					match: /[ \t\n]/ ,
					state: 'declarationAfterProperty' ,
				} ,
				{
					match: ':' ,
					state: 'declarationAfterColon'
				} ,
				{
					state: 'declarationError'
				}
			]
		} ,
		declarationAfterColon: {
			action: [ 'style' , 'operator' ] ,
			branches: [
				{
					match: /[ \t\n]/ ,
					state: 'declarationAfterColon' ,
				} ,
				{
					state: 'declarationValue' ,
					propagate: true
				}
			]
		} ,
		declarationValue: {
			action: [ 'style' , 'string' ] ,
			branches: [
				{
					match: ';' ,
					state: 'declarationIdle'
				}
			]
		} ,
		declarationError: {
			action: [ 'style' , 'parseError' ] ,
			branches: [
				{
					match: '}' ,
					state: 'idle'
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

