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

let content = new termkit.Text( {
	parent: document.elements.auto ,
	content: "hello world" ,
	attr: { color: 'green' , italic: true }
} )

let activityBar = new termkit.ColumnMenu({
  parent: document.elements.activitybar,
	multiLineItems: true,
  items: [
    {
      content: "\n F \n",
      value: "tree"
    }
  ]
}).on('submit', onSubmit)

// when a button in activityBar is pressed
function onSubmit(buttonValue, action) {
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

let sidebar = new termkit.Text( {
	parent: document.elements.sidebar ,
	content: '' ,
	attr: { color: 'cyan' , bold: true },
} )


sidebar.openPane    = null
sidebar.widthOpen   = 20
sidebar.widthClosed = 0
sidebar.isOpen      = false

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
    if (sidebar.isOpen) {
      while(elm.width > sidebar.widthClosed) {
        elm.width -= 1
        layout.computeBoundingBoxes()
        layout.redraw()
      }
      
    } else {
      sidebar.openPane = "tree"
      // sidebar.setContent(app.tree)
  
      while(elm.width < sidebar.widthOpen) {
        elm.width += 1
        layout.computeBoundingBoxes()
        layout.redraw()
      }
  }

  layout.computeBoundingBoxes()
  layout.redraw()
  sidebar.isOpen = !sidebar.isOpen
}



//----------

// setup tree view

function createTree(pathStr = __dirname) {
  let folderClosed = "▪"
  let folderOpen   = "▫"

  //@todo extract this into settings
  let options = {
    excludeHidden: true,
    foldersFirst: true
  }


  // sort them after grabbing
  let treeContent = fs.readdirSync(pathStr)
      .sort((a, b) => {
        path.parse(a).name.normalize().localeCompare(path.parse(b).name.normalize())
  })

  // split them up
  let files = treeContent.filter(file => fs.lstatSync(path.join(pathStr, file)).isFile())
  let folders = treeContent.filter(file => !fs.lstatSync(path.join(pathStr, file)).isFile())

  let treeItems = []

  folders.forEach(folder => {
    treeItems.push({
      content: `${path.parse(folder).name.normalize()}/`,
      value: folder
    })
  })
  
  files.forEach(file => {
    treeItems.push({
      content: path.parse(file).base,
      value: file
    })
  })

  app.tree = new termkit.ColumnMenu({
    // width: 20,
    parent: document.elements.sidebar,
    items: treeItems
  })
}
createTree()



// -- prep for user pre-first render

layout.layoutDef.columns.filter(col => col.id == 'sidebar')[0].width = sidebar.widthClosed
layout.computeBoundingBoxes()
layout.redraw()