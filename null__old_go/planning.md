



=============================

mvp
  open app with directory path
  open app with filepath

v1
  modal / popup
  open terminal
  

=============================

main app


components

  omnibar
    popup modal
    open file
    view recent commands
    allow plugins to register commands

  statusbar
    check if within tmux?
    customizable
    any edge of screen

  sidebar
    customizable
    any edge of screen

  main viewport
    code editor
    split screen up to 4 panes

  ---

data to store
  path of open files
  directory where app was opened
  directory that was passed to app as root dir


plugins:

  project management:
    open files
    scroll level
    splitscreen setup
    cursor position

  filetree
    show/hide
    change directory
    show multiple directories
    highlight open files

  git integration
    diff viewer
    gutter colorized changes
    git commands
    commit tree (git graph)
