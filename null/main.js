"use strict" ;
var termkit = require('terminal-kit')
var fs = require('fs')
var path = require('path')

var term = termkit.terminal

term.clear() ;

function isFile(filePath) {  
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
}

// https://stackoverflow.com/a/15778396
function getExt(filePath) {
  return filePath
  .split('.')
  .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
  .slice(1)
  .join('.')
}
function getLang(filePath) {
  let ext = getExt(filePath)

  switch(ext)
  {
    case "css":
      return "css";

    case "js":
      return "javascript";
    
    case "vue":
      return "vue";
    
    case "xml":
      return "xml";
    
    default:
      return "javascript";
  }
}

var document = term.createDocument( {
  	// backgroundAttr: { bgColor: 'magenta' , dim: true } ,
  } ) ;
  
  
  
  let filePath
  let fileContent
  let fileLang

  if (process.argv.slice(2).length == 0) {
    fileContent = ""
  } else {
    filePath = process.argv.slice(2).toString()
    fileLang = getLang(filePath)
    let pathIsFile = isFile(filePath)
    
    if (!pathIsFile) {
      fileContent = `${filePath} is not a file!`
    } else {
      fileContent = fs.readFileSync(filePath)
    }
  }
  
  try {
    var StateMachine = require( 'text-machine' ) ;
  
    var stateMachine = new StateMachine( {
      program: require( `text-machine/languages/${getLang(filePath)}.js` ) ,
      api: termkit.TextBuffer.TextMachineApi
    } ) ;
  }
  catch( error ) {
    if ( error.code === 'MODULE_NOT_FOUND' ) {
      fileContent = 'Try to:\n"npm install text-machine"\n... to enjoy a mini demo of\na Javascript syntax highlighter!' ;
    }
    else {
      throw error ;
    }
  }
  
  
  
  var textBox = new termkit.EditableTextBox( {
    parent: document ,
    content: fileContent ,
    // attr: { bgColor: 'black' } ,
    //hidden: true ,
    x: 0 ,
    y: 0 ,
    width: term.width,
    height: term.height ,
    scrollable: true ,
    vScrollBar: true ,
    tabWidth: 2 ,
    lineWrap: true ,
    wordWrap: true ,
    stateMachine: stateMachine,
    extraScrolling: true
  } ) ;
  
  document.giveFocusTo( textBox ) ;
  
  //setTimeout( () => textBox.setTabWidth( 8 ) , 1000 ) ;
  //setTimeout( () => textBox.setTabWidth( 2 ) , 2000 ) ;
  
  term.on( 'key' , function( key ) {
    switch( key ) {
      case 'CTRL_C' :
        term.grabInput( false ) ;
        term.hideCursor( false ) ;
        term.styleReset() ;
        term.clear() ;
        process.exit() ;
        break ;
      
      case 'CTRL_D' :
        term.saveCursor() ;
        term.moveTo( 1 , 25 ) ;
        term.styleReset() ;
        term.eraseDisplayBelow() ;
        term( "Content: %s" , textBox.getContent().replace( /\n/g , '\\n' ).replace( /\t/g , '\\t' ) ) ;
        term.restoreCursor() ;
        break ;
      
      case 'CTRL_W' :
        textBox.textBuffer.wrapAllLines( 20 ) ;
        textBox.draw() ;
        break ;
    }
  } ) ;