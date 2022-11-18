"use strict"
var termkit = require('terminal-kit')
var fs = require('fs')
const { resolve } = require('path')

var term = termkit.terminal

term.clear()

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
} )

  

let filePath
let fileContent
let fileLang = "javascript"

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
  var StateMachine = require( 'text-machine' )

  var stateMachine = new StateMachine( {
    program: require( `text-machine/languages/${fileLang}.js` ) ,
    api: termkit.TextBuffer.TextMachineApi
  } )
}
catch( error ) {
  if ( error.code === 'MODULE_NOT_FOUND' ) {
    fileContent = 'Try to:\n"npm install text-machine"\n... to enjoy a mini demo of\na Javascript syntax highlighter!'
  }
  else {
    throw error
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
} )

document.giveFocusTo( textBox )
textBox.textBuffer.moveTo(0,0)

//setTimeout( () => textBox.setTabWidth( 8 ) , 1000 )
//setTimeout( () => textBox.setTabWidth( 2 ) , 2000 )

term.on( 'key' , async function( key ) {
  switch( key ) {
    case 'CTRL_C' :
      term.grabInput( false )
      term.hideCursor( false )
      term.styleReset()
      term.clear()
      process.exit()
      break
    
    case 'CTRL_D' :
      term.saveCursor()
      term.moveTo( 1 , 25 )
      term.styleReset()
      term.eraseDisplayBelow()
      term( "Content: %s" , textBox.getContent().replace( /\n/g , '\\n' ).replace( /\t/g , '\\t' ) )
      term.restoreCursor()
      break
    
    case 'CTRL_W' :
      //todo extract this linewrap magic number into settings
      textBox.textBuffer.wrapAllLines( 20 )
      textBox.draw()
      break

    case 'CTRL_S' : 
      let content = textBox.getContent()

      // opened with path
      if (!filePath) {
        // ask for namepath
        let str = "enter filepath"
        filePath = await prompt(str)
        console.log(filePath)
      }

      // in case we cancelled the prompt and it returned empty
      if (filePath) {
        fs.writeFileSync(filePath, content)
      }
      break
    
    case 'CTRL_SPACE' :
      omni()
  }
} )

function prompt(str = "") {
  return new Promise((resolve, rej) => {
    let width = 50
    let height = 10
    let x = 15 //(term.width / 2) - ((width + 2) / 2)
    let y = 15 //(term.height / 2) - ((height + 2) / 2)
    //todo listen to esc and cancel prompt without doing anything
    let window = new termkit.Window({
      parent: document,
      x: x,
      y: y,
      height: height,
      width: width,
      inputHeight: 3,
      title: str,
      movable: false,
      scrollable: false,
    }) 
  
    let input = new termkit.InlineInput({
      parent: window,
      palceholder: "path/to/save",
      attr: {color: 'green, italic: true'},
      prompt: str,
      width: window.width,
      height: window.height
    })
  
    input.on('submit', onSubmit)
    input.on('cancel', onCancel)

    function onSubmit(val) {
      resolve(val)
      term.restoreCursor()
      window.destroy()
    }

    function onCancel() {
      resolve()
      term.restoreCursor()
      window.destroy()
    }

    document.focusNext()
  })

}

function omni() {
  let cmd = prompt()
  console.log(prompt)
}
