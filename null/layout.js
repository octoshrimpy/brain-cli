"use strict"
var termkit     = require('terminal-kit')
var fs          = require('fs')
var path        = require('path')
var { inspect } = require('util')

//@todo setup LSP
// https://langium.org or something else from https://langserver.org
var   StateMachine = require( 'text-machine' )

var term = termkit.terminal

let app = {}

app.filePath

term.clear()
//term.moveTo.brightMagenta.bold.italic( 1 , 1 , "Responsive terminal layout! Try resizing your terminal!)" )

var document = term.createDocument()

var layout = new termkit.Layout( {
	parent: document ,
	boxChars: 'single' ,
	layout: {
		id: 'main' ,
		y: 0,
		//widthPercent: 60 ,
		widthPercent: 100 ,
		//heightPercent: 60 ,
		heightPercent: 100 ,
    columns: [
      { id: 'activitybar' , width: 5} ,
      // this has to be 2 because of https://github.com/cronvel/terminal-kit/blob/5e51ff852ac69af2d21be8e7fd36a236ecbb9386/lib/document/Layout.js#L186
      //@todo figure out how to load a component hidden
      { id: 'sidebar' , width: 20} , 
      { id: 'auto' } ,
    ]
	}
} )


term.hideCursor()
//layout.draw()
// layout.setAutoResize( true )

// app.content = new termkit.Text( {
// 	parent: document.elements.auto ,
// 	content: "hello world" ,
// 	attr: { color: 'green' , italic: true }
// } )

app.activityBar = new termkit.ColumnMenu({
  parent: document.elements.activitybar,
	multiLineItems: true,
  items: [
    {
      content: "\n F \n",
      disableBlink: true,
      value: "tree"
    }
  ]
}).on('submit', onActivityBarSubmit)

// when a button in activityBar is pressed
function onActivityBarSubmit(buttonValue, action) {
  switch(buttonValue) {
    case "tree":
      toggleTree()
      document.focusNext()
  }
}

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


term.on( 'key' , function( key ) {
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
    
    case 'CTRL_G':
      // debug
      // let pretty = 
      // console.log(inspect(layout.layoutDef.columns, {compact: false, depth: 3}))
      // console.log(inspect(document.elements._Layout_1, {compact: false, depth: 0}))
      // console.log(inspect(layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = 30))
      // document.draw()
      layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = 0
      layout.computeBoundingBoxes()
      layout.redraw()
    }
    
  } )
  
  
  function toggleTree() {
    let elm = layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0]
    if (app.sidebar.isOpen) {
      while(elm.width > app.sidebar.widthClosed) {
        elm.width -= 1
        layout.computeBoundingBoxes()
        layout.redraw()
      }
      
    } else {
      app.sidebar.openPane = "tree"
      // app.sidebar.setContent(app.sidebar.tree)
  
      while(elm.width < app.sidebar.widthOpen) {
        elm.width += 1
        layout.computeBoundingBoxes()
        layout.redraw()
      }
  }

  layout.computeBoundingBoxes()
  layout.redraw()
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
    // fileLang = termkit.fileHelpers.getLang(filePath)
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
  editor.stateMachine = stateMachine
  editor.setContent(fileContent)
  editor.filePath = filePath

  document.giveFocusTo( editor )
  editor.textBuffer.moveTo(0,0)
}







//=======================================================
// -- prep for user pre-first render

layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = app.sidebar.widthClosed
layout.computeBoundingBoxes()
layout.redraw()


//@todo allow passing in whole directories
editor.open(process.argv.slice(2))