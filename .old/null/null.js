"use strict"
var termkit     = require('terminal-kit')
var fs          = require('fs')
var path        = require('path')
var { inspect } = require('util')

let App = require('./components/app')
let Layout = require('./components/layout')

//@todo setup LSP
// https://langium.org or something else from https://langserver.org
var   StateMachine = require( 'text-machine' )

var term = termkit.terminal

term.clear()
//term.moveTo.brightMagenta.bold.italic( 1 , 1 , "Responsive terminal layout! Try resizing your terminal!)" )

var document = term.createDocument()


let app = new App(document)
app.layout = new Layout(document)

app.filePath


term.hideCursor()


// app.activityBar = new termkit.ColumnMenu({
//   parent: document.elements.activitybar,
// 	multiLineItems: true,
//   items: [
//     {
//       content: "\n F \n",
//       disableBlink: true,
//       value: "tree"
//     }
//   ]
// }).on('submit', onActivityBarSubmit)


// let btnFiles = new termkit.Button({
//   parent: activityBar,
//   content: " F ",
//   width: 3
// })

app.sidebar = new termkit.Text( {
	parent: document.elements.sidebar ,
	content: '' ,
	attr: { color: 'cyan' , bold: true },
} )


app.sidebar.openPane    = null
app.sidebar.widthOpen   = 25
app.sidebar.widthClosed = 0
app.sidebar.isOpen      = false

term.grabInput( { mouse: 'button' } )

term.on('mouse', (name, opts) => {
  // document.elements.auto.setContent(name)
  // console.log(name)
  // auto.setContent(name)
})


term.on( 'key' , async function( key ) {
	switch(key)
  {
    case 'CTRL_C':
      term.grabInput( false )
      term.hideCursor( false )
      term.moveTo( 1 , term.height )( '\n' )
      //term.clear()
      process.exit()
      break
    
    case 'CTRL_E':
      toggleTree()
      break    
      
    //@todo extract this logic into `app.save(content)`
    case 'CTRL_S' : 
      let content = editor.getContent()

      // not opened with a path, doesn't exist yet
      if (!editor.filePath) {

        // ask for namepath
        let prompt = "enter filepath: "
        let placeholder = "save/to/path"

        // create floating input
        editor.filePath = await createInput(prompt, placeholder)

      }

      // in case we cancelled the prompt and it returned empty 
      if (editor.filePath) {

        // write to path given
        writeToFile(editor.filePath, content)
      }
      break
  
      // https://github.com/cronvel/terminal-kit/blob/master/lib/vte/toInputSequence.js#L173
      // grabbing 'CTRL_SPACE'
      case 'NUL' :
        await omni()
    
    case 'CTRL_G':
      // debug
      // let pretty = 
      // console.log(inspect(layout.layoutDef.columns, {compact: false, depth: 3}))
      // console.log(inspect(document.elements._Layout_1, {compact: false, depth: 0}))
      // console.log(inspect(layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = 30))
      // document.draw()
      app.layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = 0
      app.layout.computeBoundingBoxes()
      app.layout.redraw()
    }
    
  } )
  
  
  function toggleTree() {
    let elm = app.layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0]
    if (app.sidebar.isOpen) {
      while(elm.width > app.sidebar.widthClosed) {
        elm.width -= 1
        app.layout.computeBoundingBoxes()
        app.layout.redraw()
      }
      
    } else {
      app.sidebar.openPane = "tree"
      // app.sidebar.setContent(app.sidebar.tree)
  
      while(elm.width < app.sidebar.widthOpen) {
        elm.width += 1
        app.layout.computeBoundingBoxes()
        app.layout.redraw()
      }
  }

  app.layout.computeBoundingBoxes()
  app.layout.redraw()
  app.sidebar.isOpen = !app.sidebar.isOpen
}



//----------

// setup tree view

function createTree(pathStr = __dirname) {

  //@todo extract this into settings
  let options = {
    excludeHidden: true,
    foldersFirst: true
  }

  let treeItems = path2obj(pathStr)
  app.sidebar.tree = new termkit.ColumnMenu({
    width: 100,
    parent: document.elements.sidebar,
    items: treeItems,
		disposition: 'inline'
  }).on('focus', onTreeFocus)
}
createTree()

function path2obj(pathStr = __dirname, depth = 1) {

  //@todo extract this into settings
  let folderClosed = "🖿"
  let folderOpen   = "🗁"

  let contents = fs.readdirSync(pathStr)      
    .sort((a, b) => {
      path.parse(a).name.normalize().localeCompare(path.parse(b).name.normalize())
  })

  // split them up
  let files = contents.filter(file => fs.lstatSync(path.join(pathStr, file)).isFile())
  let folders = contents.filter(file => !fs.lstatSync(path.join(pathStr, file)).isFile())

  let treeItems = []

  folders.forEach(folder => {

    // let children = path2obj(folder, depth - 1)
    let children = [ {content: "hi", value: "hi"}]
    treeItems.push({
      content: `${folderClosed} ${path.parse(folder).name.normalize()}/`,
      value: `${folder}`,
      disableBlink: true,
      items: children,
      disposition: 'inline',
      openOn: 'parentFocus' ,
      closeOn: 'parentFocus' ,
      type: "folder"
      // path: 
    })
  })
  
  files.forEach(file => {
    treeItems.push({
      content: `  ${path.parse(file).base}`,
      value: `${file}`,
      disableBlink: true,
      type: "file",
    })
  })

  return treeItems
}

function onTreeFocus(buttonValue, action) {

  let item = app.sidebar.tree.getItem( buttonValue )
  
  if (item.type == "folder") {
    // app.sidebar.tree.setItem(item, {content: "hello world"})
    // console.log(item)

    //@todo implement this custom tree collapse menu
    // if folder state is closed
      // get index of folder clicked in app.sidebar.tree
      // get children that should show
      // get indentation level from folder clicked
      // add new children to app.sidebar.tree, with left indentation
      // set folder state to open
    // else
      // for every item after folder that has a bigger indentation number
        // item.destroy
      // set folder state to closed
  } else
  if (item.type == "file") {
    app.content.setContent()
  }
}

//=======================================================

    
let fileLang = "javascript"
var stateMachine = new StateMachine( {
  program: require( `text-machine/languages/${fileLang}.js` ) ,
  api: termkit.TextBuffer.TextMachineApi
} )



let editor = new termkit.EditableTextBox( {
  parent: document.elements.auto ,
  content: "" ,
  x: 3,
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

editor.open = async (args) => {

  let dirpath = __dirname
  let filePath
  let fileContent = ""


  // app.createTree(dirpath)
  
  if (args.length == 0) {
    fileContent = ""
  } else {
    filePath = args.toString()
    // fileLang = getLang(filePath)
    fileLang = "javascript"
    let pathIsFile = fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()
    
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

  //@fixme can't change statemachine
  // editor.stateMachine = stateMachine
  editor.setContent(fileContent)
  editor.filePath = filePath

  document.giveFocusTo( editor )
  editor.textBuffer.moveTo(0,0)
}




app.cmdHistory = []
app.cmds = {
  quit: (args) => app.quit(),
  open: async (args) => {
    let opts = { baseDir: './', autoCompleteMenu: true, autoCompleteHint: true }
    let filePath = await createInput("path: ", "", termkit.InlineFileInput, opts)
    filePath && await app.open(filePath)
  },
}












/**
 * writes given contents into given 
 *          filepath, whether it exists or not
 * 
 * @param {string} filePath - path to file to write, does not have to exist
 * @param {string} contents - plaintext to write to file
 * 
 * @todo alert user that file was saved
 */
 function writeToFile(filePath, contents, cb = () => {}) {
  fs.mkdir(path.dirname(filePath), { recursive: true}, function (err) {
    if (err) return cb(err);
    
    fs.writeFile(filePath, contents, cb);
  });
}



/**
 * opens omnibar
 * 
 * @todo load available commands into auto-complete
 * @done set files in current open directory as autocomplete
 */
 async function omni() {
  let cmd = await createInput()
  
  cmd != null && await cmdHandler(cmd)
}

/**
 * does the logic for the given command
 * 
 * @param {string} cmdstr - command to run
 * 
 * @todo each command should be extracted into its own file
 * @todo iter over the commands directory in settings
 */
async function cmdHandler(cmdStr) {
  
  app.cmdHistory.push(cmdStr)

  let cmd = cmdStr.split(" ").shift()

  if (cmd in app.cmds) {
    return app.cmds[cmd].call(this, cmdStr)
  }
  return 

  switch(cmd)
  {
    case "quit" :
      app.quit()
      break;
    
    case "open" : 
      //@todo set basedir as the dir of currently open file
      let opts = { baseDir: './', autoCompleteMenu: true, autoCompleteHint: true }
      let filePath = await createInput("path: ", "", termkit.InlineFileInput, opts)
      await app.open(filePath)
      break
  }
}

/**
 * creates floating input used in any popup menu
 * 
 * @param {string} prompt - inline label for the input
 * @param {string} placeholder - placeholder text for input
 * @param {termkit-input} type - LabeledInput, InlineInput, InlineFileInput
 * @param {Object} [opts = {}] - optional options to pass to the input
 * 
 * @returns {Promise} promise represents resulting content from input upon input close
 * 
 * @todo figure out better way to handle all these options
 */
async function createInput(prompt = '', placeholder = '', type = null, opts = {}) {

  let inputType = type != null ? type : termkit.InlineInput;
  
  //@todo extract position into opts/settings so user can decide where it opens
  let x = (term.width / 2) - 25 - 4
  
  // automatically build the command autocomplete system
  let cmdAutocomplete = []
  Object.keys(app.cmds).forEach(cmd => cmdAutocomplete.push(cmd))

  // setup params and init
  var input = new (inputType)( {
    ...opts,
    parent: document ,
    // textAttr: { bgColor: 'blue' } ,
    // voidAttr: { bgColor: 'blue' } ,
    placeholder: placeholder ,
    x: x ,
    y: 10 ,
    prompt: {
      // textAttr: { bgColor: 'blue' } ,
      content: prompt,
      contentHasMarkup: true
    } ,
    width: 50 ,
    cancelable: true,
    autoCompleteMenu: true,
    autoCompleteHint: true,
    history: app.cmdHistory,
    autoComplete: cmdAutocomplete,
    menu: {
      y: 2,
      buttonBlurAttr: { bgColor: 'default' , color: 'default' } ,
      buttonFocusAttr: { bgColor: 'green' , color: 'black'} ,
      buttonDisabledAttr: { bgColor: 'white' , color: 'brightBlack' } ,
      buttonSubmittedAttr: { bgColor: 'brightWhite' , color: 'brightBlack' } ,
      buttonSeparatorAttr: { bgColor: 'default' } ,
      backgroundAttr: { bgColor: 'default' } ,
      //leftPadding: ' ' , rightPadding: ' ' ,
      justify: true ,
      keyBindings: Object.assign( {} , termkit.ColumnMenu.prototype.keyBindings , {
        TAB: 'next' ,
        SHIFT_TAB: 'previous'
      })
    }
  } )

  var border = new termkit.Border({
    parent: input,
    attr: {bgColor: ''},
    frameChars: 'lightRounded'
  })

  document.giveFocusTo(input) /// focus input
  
  //@todo terminalkit has promises built-in. 
  // figure it out, and replace this monstrosity
  return new Promise((resolve, rej) => {

    // create a cancel event in here,
    // as the inputs created will always be the same
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

    //@todo on click outside the omni, cancel
  })
}

  /**
   * returns true if given path is a file
   * 
   * @param {string} filepath 
   * @returns boolean file is file
   */
  let isFile = (filePath) => {  
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
  }
  
  /**
   * gets proper extension for given file, ie: `.tar.gz`, instead of just `.gz`
   * 
   * @source https://stackoverflow.com/a/15778396
   * @param {string} filepath
   * @returns {string} file extension starting with `.`, ie: `.md`
   * 
   * @todo check if it's a file before attempting anything
   */
  let getExt =(filePath) => {
    return filePath
    .split('.')
    .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
    .slice(1)
    .join('.')
  }

  /**
   * gets text-machine language for given file
   * 
   * @param {string} filepath
   * @returns {string} text-machine language
   */
  let getLang =(filePath) => {
    let ext = getExt(filePath)
    
    //@todo set default as plaintext
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






//=======================================================
// -- prep for user pre-first render

app.layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = app.sidebar.widthClosed
app.layout.computeBoundingBoxes()
app.layout.redraw()


//@todo allow passing in whole directories
editor.open(process.argv.slice(2))