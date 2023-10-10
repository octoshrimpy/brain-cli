"use strict"
var termkit     = require('terminal-kit')

class Activitybar {
  constructor(document) {
    this.document = document
  }

  new() {
    return new termkit.ColumnMenu({
      parent: this.document.elements.activitybar,
      multiLineItems: true,
      items: [
        {
          content: "\n F \n",
          disableBlink: true,
          value: "tree"
        }
      ]
    }).on('submit', this.onActivityBarSubmit)
  }

// when a button in activityBar is pressed
onActivityBarSubmit(buttonValue, action) {
  switch(buttonValue) {
    case "tree":
      app.toggleTree()
      this.document.focusNext()
  }
}
}

module.exports = Activitybar
