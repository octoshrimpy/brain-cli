# todo specs
_designation of systems for a todo and notes conglomerate_

## actionable items
* todo
* task
* book
* note
  * idea
  * snip
  * log
  * card

## structure
* book
  * todo
    * task
  * note types:
    * base 
    * idea
    * snip
    * log
    * card
    * box

---
  
## metadata
* tag
  * no spaces
  * begins with `#`
  * string
  * max length of 25 
* title
  * string
  * max length of 50
* content
  * string
* priority
  * `* icebox`
  * `_ default`
  * `> hack (2)`
  * `! fixme (1)`
* completionStatus
  * `_ default`
  * `o ongoing`
  * `? think`
  * `/ blocked`
  * `- cancelled`
  * `x done`
* archivalState
  * missing defaults to `false`
  * boolean
* timestamp
  * unix timestamp
* box
  * array, can hold anything
* link
  * `[[book:notetitle/taskid]]` or `[[bookid:noteid]]` - wikilinks
* extension
  * `.md`, `.js` - extension of snippets for syntax highlighting
* id
  * `` //@todo figure out how to generate non-identical IDs
* childInheritance
  * whether anything within a box within itself will inherit tags
  * missing defaults to `false`
  * boolean
* directoryPath
  `/root/path/to/folder`

---

## todo
_holds one or more sub-tasks_

* has:
  * id
  * archivalState
  * tag(s)
  * timestamp
  * priority
  * completionStatus
  * title
  * box:task

```md
---
@id         [id goes here]
@unix       [unix timestamp]
@tags       #tag #tag1 #tag2
@archived   true 
---

# [ ][ ] Title of todo
     [ ] task
     [ ] task
```


## task
_child of todo, contains a single action_

* has:
  * completionStatus
  * content
  * timestamp
  * id

```md
---
@id         [id goes here]
@unix       [unix timestamp]
---

[ ] name of thing to do
```


## book
_holds one or more notes_

* has: 
  * title
  * archivalState
  * box:note
  * directoryPath
  * tag(s)
  * id
  * childInheritance

```md
---
@id         [id goes here]
@tags       #tag #tag1 #tag2
@archived   true 
---

# Title of book

### [[note1]]
### [[note2]]
```


## note
_base classification for how info is stored_

* has:
  * id
  * archivalState
  * tag(s)
  * inherited tag(s)
  * timestamp
  * title
  * content

```md
---
@id         [id goes here]
@archived   true 

@tags       #tag #tag1 #tag2
@inherits   #tag3 #tag4
@unix       [unix timestamp]
---

# Title of note

this is note content, in md/txt form
```


#### idea
_holds a thought to ponder about later_
_inherits metadata from note_

* has: 
  * title - main idea
  * content - itemized list of smaller related ideas


#### snip
_hold a bit of code, for quick copypasta_
_inherits metadata from note_

* has:
  * title - description of what it does
  * extension


#### log
_timestamped entry of occurences_

* has:
  * timestamp
  * content


#### card
_flashcard for knowledge-checking_
_inherits metadata from note_

* has: 
  * timestamp
  * archivalState
  * todoStatus
  * priority
  * title (question)
  * box:content (answers)
  * content (answer)

---

## hotkey design

ctrl    - base command key
shift   - `plus` modifier, adds more to selections


## ideas

* when modifying a task, create log accordingly
* when modifying a todo, create log accordingly
* what if note IDs has the book as a preface
  * 28s1:2f83gg9
  * 28s1:gj590f2
* @created, @changed instead of @unix
* docker/server that handles API calls, and runs commands, converts them to json, and returns
  * for any frontend
  * auth?
  * single server per person? multi person?
* filepicker/dirbrowser in a popup modal
  * fzf/ripgrep
  * thin
    * tree-style, no previews
  * full
    * ranger-like, with content previews
  * what if notes had templates
    * types above were the basic templates shipped
  * git tracking from the main directory where books are kept

---

made with 💜 by 🐙🦐