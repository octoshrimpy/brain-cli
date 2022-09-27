# I don't like these
# need to rethink usability, scale, and how to interact with items

# add item
note add "foo"
note + book "book title"
note +b "book title"
note +t "todo"
note + todoID:"task name"
# title | question | number.answers | number of correct answer
# answers can be empty 
note +c "card title | question | 1.answer, 2.answer, 3.answer | 2 " 
note +s "snippet"
note log "content"
note +s workSnips:"convert string to number" "content" -ext js

# add note to book, and open in editor
note + book:noteID

# see notes in current selected book
note list
note

# search for string in notes
note search "string"
note "search string"

# edit specific note
# prompt for creating new if it does not exist
note edit notetitle
note edit itemID
note itemID -e

# view note
note notetitle
note book:notetitle
note open itemID
note itemID -o

# search note
note search "string"
note search /regex/
note search :title "string"
note search :tag "tag"

# delete note
note delete notetitle
note -d itemID
note itemID -d

# navigation between books
# prompt for creating new if it does not exist
note go "bookname"
note go bookID

# search for a note or
note go -s :title "recipes"

note +b "/path/to/folder" "book title"
