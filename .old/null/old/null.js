"use strict"
var termkit     = require('terminal-kit')
var fs          = require('fs')
var path        = require('path')
var { inspect } = require('util')

//@todo setup LSP instead of text-machine
// https://langium.org or something else from https://langserver.org
var StateMachine    = require( 'text-machine' )
var term            = termkit.terminal

// debugging
function sleep(s) {
  return new Promise((resolve) => {
    setTimeout(resolve, (s * 1000));
  });
}


// ⋯ layout ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯

var document = term.createDocument({})

let layout = new termkit.Layout({
  parent: document,
  boxChars: 'single',
  layout: {
    id: 'main',
    widthPercent: 100,
    heightPercent: 100, 
    columns: [
      { id: 'activitybarContainer' , width: 5} ,
      // this has to be 2 because of https://github.com/cronvel/terminal-kit/blob/5e51ff852ac69af2d21be8e7fd36a236ecbb9386/lib/document/Layout.js#L186
      //@todo figure out how to load a component hidden
      { id: 'sidebarContainer' , width: 20} , 
      { id: 'editorContainer' } ,
    ]
  }
})

// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ base app control ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
//@todo figure out better logic for these methods and properties

/**
 * the base app
 * 
 * @namespace app
 */
var app = {

  /**
   * close application
   * 
   * @memberof app
   * 
   * @todo fix processExit according to docs: https://github.com/cronvel/terminal-kit/blob/master/doc/high-level.md#ref.processExit 
   */
  quit: () => {
    term.grabInput( false )
    term.hideCursor( false )
    term.styleReset()
    term.clear()
    process.exit()
  },

  /**
   * open a file/path
   * 
   * @param {string} filepath - path to the file to open
   * 
   * @memberof app
   * 
   * @todo handle folder path too
   */
  open: async (args) => {

    let dirpath = __dirname
    let filePath
    let fileContent = ""
    let fileLang = "javascript"


    app.createTree(dirpath)
    
    if (args.length == 0) {
      fileContent = ""
    } else {
      filePath = args.toString()
      fileLang = termkit.fileHelpers.getLang(filePath)
      // console.log(fileLang)
      let pathIsFile = termkit.fileHelpers.isFile(filePath)
      
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


    console.log(fileContent)
    app.editor.stateMachine = stateMachine
    app.editor.setContent(fileContent)
    app.editor.filePath = filePath

    document.giveFocusTo( app.editor )
    app.editor.textBuffer.moveTo(0,0)
  },

  //@fixme document this
  toggleTree: () => {
    let elm = layout.layoutDef.columns.filter(col => col.id == 'sidebarContainer')[0]
    
    if (app.sidebar.isOpen) {
      while(elm.width > app.sidebar.widthClosed) {
        elm.width -= 1
        layout.computeBoundingBoxes()
        layout.redraw()
      }
      
    } else {
      app.sidebar.openPane = "tree"
      // app.sidebar.setContent(app.tree)
  
      while(elm.width < app.sidebar.widthOpen) {
        elm.width += 1
        layout.computeBoundingBoxes()
        layout.redraw()
      }
    }

    layout.computeBoundingBoxes()
    layout.redraw()
    app.sidebar.isOpen = !app.sidebar.isOpen
  },

  //@fixme document this
  createTree: (pathStr = __dirname) => {

    //@todo extract this into settings
    let options = {
      excludeHidden: true,
      foldersFirst: true
    }
  
    let treeItems = termkit.fileHelpers.path2obj(pathStr)
    app.tree = new termkit.ColumnMenu({
      width: 100,
      parent: document.elements.sidebar,
      items: treeItems,
      // disposition: 'inline'
      //@todo should this be a `this`?
    }).on('focus', app.onTreeFocus)
  },

  //@fixme document this
  onTreeFocus:(buttonValue, action) => {

    let item = app.tree.getItem( buttonValue )
    
    if (item.type == "folder") {
      // app.tree.setItem(item, {content: "hello world"})
      // console.log(item)
  
      //@todo implement this custom tree collapse menu
      // if folder state is closed
        // get index of folder clicked in app.tree
        // get children that should show
        // get indentation level from folder clicked
        // add new children to app.tree, with left indentation
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
}


// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ app module: editor ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
//@todo extract most of these into an app.settings object
//@todo figure out how to change statemachine on the fly

app.editor = new termkit.EditableTextBox( {
  parent: document.elements.editorContainer ,
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
//@fixme blur isn't an event.. 🤔
.on('focus', () => term.hideCursor(false))
.on('blur', () => term.hideCursor(true))

// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ app module: activity bar ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯

app.activityBar = new termkit.ColumnMenu({
  parent: document.elements.activitybarContainer,
	multiLineItems: true,
  items: [
    {
      content: "\n F \n",
      disableBlink: true,
      value: "tree"
    }
  ]
}).on('submit', onActivityBarSubmit)

  //@fixme document this
function onActivityBarSubmit(buttonValue, action) {
  switch(buttonValue) {
    case "tree":
      app.toggleTree()
      document.focusNext()
  }
}
// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ app module: sidebar ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯

app.sidebar = new termkit.Text( {
	parent: document.elements.sidebarContainer ,
  content: ''
} )

app.sidebar.openPane    = null
app.sidebar.widthOpen   = 25
app.sidebar.widthClosed = 0
app.sidebar.isOpen      = false



// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ app pre-load setup ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯

// this is a hacky workaround. 
//@todo find way to detect if term has alternateBuffer
term.clear()

//@todo set default as plaintext isntead of javascript
var stateMachine = new StateMachine( {
  program: require( `text-machine/languages/javascript.js` ) ,
  api: termkit.TextBuffer.TextMachineApi
} )


/**
 * handle keyboard inputs on the terminal
 * 
 * @param {string} key - termkit keystring
 * 
 * @todo add ctrl_o to open a file
 */
term.on( 'key' , async function( key ) {
  switch( key ) {
    case 'CTRL_C' :
      app.quit()
      break

    case 'CTRL_E':
      app.toggleTree()
      break
      
    //@todo extract this logic into `app.save(content)`
    case 'CTRL_S' : 
      let content = app.editor.getContent()

      // not opened with a path, doesn't exist yet
      if (!app.editor.filePath) {

        // ask for namepath
        let prompt = "enter filepath: "
        let placeholder = "save/to/path"

        // create floating input
        app.editor.filePath = await createInput(prompt, placeholder)

      }

      // in case we cancelled the prompt and it returned empty 
      if (app.editor.filePath) {

        // write to path given
        writeToFile(app.editor.filePath, content)
      }
      break

    // https://github.com/cronvel/terminal-kit/blob/master/lib/vte/toInputSequence.js#L173
    // grabbing 'CTRL_SPACE'
    case 'NUL' :
      await omni()
  }
} )

/**
 * writes given contents into given 
 *          filepath, whether it exists or not
 * 
 * @param {string} filePath - path to file to write, does not have to exist
 * @param {string} contents - plaintext to write to file
 * 
 * @todo alert user that file was saved
 */
function writeToFile(filePath, contents) {
  fs.mkdir(dirname(filePath), { recursive: true}, function (err) {
    if (err) return cb(err);
    
    fs.writeFile(filePath, contents);
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
  
  let cmd = cmdStr.split(" ")[0]
  // console.log(cmd)
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
  
  // setup params and init
  var input = new (inputType)( {
    ...opts,
    parent: document ,
    textAttr: { bgColor: 'blue' } ,
    voidAttr: { bgColor: 'blue' } ,
    placeholder: placeholder ,
    x: x ,
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



// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ better fileHelpers ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
//@todo extract this into its own folder

termkit.fileHelpers = {

  /**
   * returns true if given path is a file
   * 
   * @param {string} filepath 
   * @returns boolean file is file
   */
  isFile: (filePath) => {  
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
  },
  
  /**
   * gets proper extension for given file, ie: `.tar.gz`, instead of just `.gz`
   * 
   * @source https://stackoverflow.com/a/15778396
   * @param {string} filepath
   * @returns {string} file extension starting with `.`, ie: `.md`
   * 
   * @todo check if it's a file before attempting anything
   */
  getExt: (filePath) => {
    return filePath
    .split('.')
    .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
    .slice(1)
    .join('.')
  },

  /**
   * gets text-machine language for given file
   * 
   * @param {string} filepath
   * @returns {string} text-machine language
   */
  getLang: (filePath) => {
    let ext = termkit.fileHelpers.getExt(filePath)
    
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
  },

  //@fixme document
  path2obj: (pathStr = __dirname, depth = 1) => {

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
}

// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
// ⋯ app post-load logic ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯

// layout.layoutDef.columns.filter(col => col.id == 'sidebarContainer')[0].width = app.sidebar.widthClosed
// layout.computeBoundingBoxes()
// layout.redraw()

term.grabInput( { mouse: 'button' } )

term.hideCursor()

//@todo allow passing in whole directories
app.open(process.argv.slice(2))

// ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
