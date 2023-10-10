"use strict"
var termkit     = require('terminal-kit')

class Layout {
  constructor(document){
    this.document = document
  }

  new() {
    return new termkit.Layout( {
      parent: this.document ,
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
  } 
} 

module.exports = Layout