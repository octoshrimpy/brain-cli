"use strict"
var   termkit      = require('terminal-kit')
var   fs           = require('fs')
const { dirname }  = require('path')
var   StateMachine = require( 'text-machine' )

var term = termkit.terminal

let app = {}


// =========---------


app.quit = () => {
  term.grabInput( false )
  term.hideCursor( false )
  term.styleReset()
  term.clear()
  process.exit()
}

app.open = async (args) => {

  let filePath
  let fileContent
  let fileLang = "javascript"
  
  if (args.length == 0) {
    fileContent = ""
  } else {
    filePath = args.toString()
    fileLang = getLang(filePath)
    // console.log(fileLang)
    let pathIsFile = isFile(filePath)
    
    if (!pathIsFile) {
      fileContent = `${filePath} is not a file!`
    } else {
      fileContent = fs.readFileSync(filePath, 'utf8')
    }
  }
  
  var stateMachine = new StateMachine( {
    program: require( `text-machine/languages/${fileLang}.js` ) ,
    api: termkit.TextBuffer.TextMachineApi
  } )


  // console.log(fileContent)
  app.textBox.stateMachine = stateMachine
  app.textBox.setContent(fileContent)
  app.textBox.filePath = filePath

  document.giveFocusTo( app.textBox )
  app.textBox.textBuffer.moveTo(0,0)
  // return [filePath, fileContent, stateMachine]
}


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

var stateMachine = new StateMachine( {
  program: require( `text-machine/languages/javascript.js` ) ,
  api: termkit.TextBuffer.TextMachineApi
} )

app.textBox = new termkit.EditableTextBox( {
  parent: document ,
  content: "" ,
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

// attempt to open any args passed in
app.open(process.argv.slice(2))

term.on( 'key' , async function( key ) {
  switch( key ) {
    case 'CTRL_C' :
      app.quit()
      break
    
    // case 'CTRL_D' :
    //   term.saveCursor()
    //   term.moveTo( 1 , 25 )
    //   term.styleReset()
    //   term.eraseDisplayBelow()
    //   term( "Content: %s" , textBox.getContent().replace( /\n/g , '\\n' ).replace( /\t/g , '\\t' ) )
    //   term.restoreCursor()
    //   break
    
    // case 'CTRL_W' :
    //   //todo extract this linewrap magic number into settings
    //   textBox.textBuffer.wrapAllLines( 20 )
    //   textBox.draw()
    //   break

    case 'CTRL_S' : 
      let content = app.textBox.getContent()

      // not opened with a path, doesn't exist yet
      if (!app.textBox.filePath) {

        // ask for namepath
        let prompt = "enter filepath: "
        let placeholder = "save/to/path"

        // create floating input
        app.textBox.filePath = await createInput(prompt, placeholder)

      }

      // in case we cancelled the prompt and it returned empty 
      if (app.textBox.filePath) {

        // write to path given
        saveFile(app.textBox.filePath, content)
      }
      break

    // https://github.com/cronvel/terminal-kit/blob/2915d8377f8211792e4e79548ec8c261c2c9c40f/lib/vte/toInputSequence.js#L173
    // grabbing 'CTRL_SPACE'
    case 'NUL' :
      await omni()
  }
} )

function saveFile(dir, contents, cb = () => {}) {
  fs.mkdir(dirname(dir), { recursive: true}, function (err) {
    if (err) return cb(err);

    fs.writeFile(dir, contents, cb);
  });
}

async function omni() {
  let cmd = await createInput()
  
  cmd != null && await cmdHandler(cmd)
}

async function cmdHandler(cmdStr) {
  
  let cmd = cmdStr.split(" ")[0]
  // console.log(cmd)
  switch(cmd)
  {
    case "quit" :
      app.quit()
      break;
    
    case "open" : 
      let filePath = await createInput("path: ")
      await app.open(filePath)
      break
  }
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

  document.giveFocusTo(input) /// focus input
  
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
