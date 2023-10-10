"use strict"
var   termkit      = require('terminal-kit')
var   fs           = require('fs')
const { dirname }  = require('path')
var   StateMachine = require( 'text-machine' )

var term = termkit.terminal

let app = {}


term( 'Choose a file: ' ) ;

term.fileInput(
	//{ baseDir: __dirname + '/../' } ,
	{ baseDir: '../' } ,
	function( error , input ) {
		if ( error )
		{
			term.red.bold( "\nAn error occurs: " + error + "\n" ) ;
		}
		else
		{
			term.green( "\nYour file is '%s'\n" , input ) ;
		}
		
		process.exit() ;
	}
) ;