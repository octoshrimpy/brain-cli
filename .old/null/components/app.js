/** @format */

class App {

  constructor(document) {
    this.document = document
  }

  //@todo figure out better logic for these methods and properties
  quit = () => {
    term.grabInput(false)
    term.hideCursor(false)
    term.styleReset()
    term.clear()
    process.exit()
  }

  /**
   * open a file/path
   *
   * @param {string} filepath - path to the file to open
   *
   * @memberof app
   *
   * @todo handle folder path too
   */
  open = async args => {
    let dirpath = __dirname
    let filePath
    let fileContent = ''
    let fileLang = 'javascript'

    this.createTree(dirpath)

    if (args.length == 0) {
      fileContent = ''
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

    var stateMachine = new StateMachine({
      program: require(`text-machine/languages/${fileLang}.js`),
      api: termkit.TextBuffer.TextMachineApi
    })

    // console.log(fileContent)
    // this.editor.stateMachine = stateMachine
    this.editor.setContent(fileContent)
    this.editor.filePath = filePath

    this.document.giveFocusTo(this.editor)
    this.editor.textBuffer.moveTo(0, 0)
  }

  //@fixme document this
  toggleTree = () => {
    let elm = this.layout.layoutDef.columns.filter(col => col.id == 'sidebarContainer')[0]

    if (this.sidebar.isOpen) {
      while (elm.width > this.sidebar.widthClosed) {
        elm.width -= 1
        this.layout.computeBoundingBoxes()
        this.layout.redraw()
      }
    } else {
      this.sidebar.openPane = 'tree'
      // this.sidebar.setContent(this.tree)

      while (elm.width < this.sidebar.widthOpen) {
        elm.width += 1
        this.layout.computeBoundingBoxes()
        this.layout.redraw()
      }
    }

    this.layout.computeBoundingBoxes()
    this.layout.redraw()
    this.sidebar.isOpen = !this.sidebar.isOpen
  }

  //@fixme document this
  createTree = (pathStr = __dirname) => {
    //@todo extract this into settings
    let options = {
      excludeHidden: true,
      foldersFirst: true
    }

    let treeItems = path2obj(pathStr)
    this.tree = new termkit.ColumnMenu({
      width: 100,
      parent: document.elements.sidebar,
      items: treeItems
      // disposition: 'inline'
      //@todo should this be a `this`?
    }).on('focus', this.onTreeFocus)
  }

  //@fixme document this
  onTreeFocus = (buttonValue, action) => {
    let item = this.tree.getItem(buttonValue)

    if (item.type == 'folder') {
      // this.tree.setItem(item, {content: "hello world"})
      // console.log(item)
      //@todo implement this custom tree collapse menu
      // if folder state is closed
      // get index of folder clicked in this.tree
      // get children that should show
      // get indentation level from folder clicked
      // add new children to this.tree, with left indentation
      // set folder state to open
      // else
      // for every item after folder that has a bigger indentation number
      // item.destroy
      // set folder state to closed
    } else if (item.type == 'file') {
      this.content.setContent()
    }
  }
}

module.exports = App
