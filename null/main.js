"use strict"
var termkit = require('terminal-kit')
var fs = require('fs')
const { dirname } = require('path')

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

      // not opened with a path, doesn't exist yet
      if (!filePath) {

        // ask for namepath
        let prompt = "enter filepath: "
        let placeholder = "save/to/path"

        // create floating input
        filePath = await createInput(prompt, placeholder)

      }

      // in case we cancelled the prompt and it returned empty 
      if (filePath) {

        // write to path given
        saveFile(filePath, content)
      }
      break
    
    case 'CTRL_SPACE' :
      omni()
  }
} )

function saveFile(dir, contents, cb = () => {}) {
  fs.mkdir(dirname(dir), { recursive: true}, function (err) {
    if (err) return cb(err);

    fs.writeFile(dir, contents, cb);
  });
}

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


function createInput(prompt = '', placeholder = '') {

  // setup params and init
  var input = new termkit.InlineInput( {
    parent: document ,
    textAttr: { bgColor: 'blue' } ,
    voidAttr: { bgColor: 'blue' } ,
    placeholder: placeholder ,
    x: 0 ,
    y: 10 ,
    prompt: {
      textAttr: { bgColor: 'blue' } ,
      content: prompt,
      contentHasMarkup: true
    } ,
    width: 50 ,
    cancelable: true
  } )

  document.focusNext() /// focus input; not working
  
  return new Promise((resolve, rej) => {

    // create a cancel event in here,
    // as they will always be the same
    function onCancel() {
      term.saveCursor()
      input.destroy()
      document.focusNext()
      term.restoreCursor()

      resolve(null)
    }

    function onSubmit() {
      term.saveCursor()
      input.destroy()
      document.focusNext()
      term.restoreCursor()

      resolve(input.getContent())
    }

    input.on( 'cancel' , onCancel )
    input.on('submit', onSubmit)
  })
}