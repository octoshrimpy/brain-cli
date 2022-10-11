// compiling:
// https://www.digitalocean.com/community/tutorials/how-to-build-go-executables-for-multiple-platforms-on-ubuntu-20-04

package main

import (
  "fmt"
  "os"
  "strings"
  
  "github.com/charmbracelet/bubbles/help"
  "github.com/charmbracelet/bubbles/key"
  tea "github.com/charmbracelet/bubbletea"
  "github.com/charmbracelet/lipgloss"
)

// help menu
type keyMap struct {
  Up      key.Binding
  Down    key.Binding
  Left    key.Binding
  Right   key.Binding
  Select  key.Binding
  Enter   key.Binding
  Search  key.Binding
  Help    key.Binding
  Quit    key.Binding
}

//  mini help
func (k keyMap) ShortHelp() []key.Binding {
  return []key.Binding{k.Search, k.Help, k.Quit}
}

// full help menu
func (k keyMap) FullHelp() [][]key.Binding {
  return [][]key.Binding{
    {k.Up, k.Down, k.Left, k.Right},   // first column
    {k.Search, k.Help, k.Quit},                   // second column
  }
}

var keys = keyMap { 
  Up: key.NewBinding(
    key.WithKeys("up", "w"),
    key.WithHelp("↑/w", "move up"),
  ),
  Down: key.NewBinding(
    key.WithKeys("down", "s"),
    key.WithHelp("↓/s", "move down"),
  ),
  Left: key.NewBinding(
    key.WithKeys("left", "a"),
    key.WithHelp("←/a", "move left"),
  ),
  Right: key.NewBinding(
    key.WithKeys("right", "d"),
    key.WithHelp("→/d", "move right"),
  ),
  Select: key.NewBinding(
    key.WithKeys(" "),
    key.WithHelp("space", "toggle state"),
  ),
  Enter: key.NewBinding(
    key.WithKeys("enter"),
    key.WithHelp("↩", "edit file"),
  ),
  Search: key.NewBinding(
    key.WithKeys("/"),
    key.WithHelp("/", "search"),
  ),
  Help: key.NewBinding(
    key.WithKeys("?"),
    key.WithHelp("?", "toggle help"),
  ),
  Quit: key.NewBinding(
    key.WithKeys("q", "esc", "ctrl+c"),
    key.WithHelp("q", "quit"),
  ),
}


// ====================

type model struct {
  keys         keyMap
  help         help.Model
  inputStyle  lipgloss.Style
  lastKey     string
  quitting     bool

  choices      []string           // items on the list
  cursor       int              	// which todo list item our cursor is at
  selected     map[int]struct{}  	// which todo items are selected
}


func initialModel() model {
  return model {

    keys:       keys,
    help:       help.New(),
    inputStyle: lipgloss.NewStyle().Foreground(lipgloss.Color("#FF75B7")),

    // the todo list is a grocery list
    choices: []string{"carrots", "celery", "kohlrabi"},

    // a map of which choices are selected
    // using the mal like a mathematical set
    // the keys refer to the index of the choices slice, above
    selected: make(map[int]struct{}),
  }
}

func (m model) Init() tea.Cmd {
  return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
  switch msg := msg.(type) {

  case tea.WindowSizeMsg:

    // if we set a width on the help meny, i can gracefully truncate as needed
    m.help.Width = msg.Width

    // is it a keypress?
  case tea.KeyMsg:
      
    switch {
    case key.Matches(msg, m.keys.Up):
      m.lastKey = "↑"
      if m.cursor > 0 {
        m.cursor--
      }
      
    case key.Matches(msg, m.keys.Down):
      m.lastKey = "↓"
      if m.cursor < len(m.choices)-1 {
        m.cursor++
      }
    
    //enter, space toggle state for cursor selection
    case key.Matches(msg, m.keys.Select):
      _, ok := m.selected[m.cursor]

      if ok {
        delete(m.selected, m.cursor)
      } else {
        m.selected[m.cursor] = struct{}{}
      }

		case key.Matches(msg, m.keys.Left):
			m.lastKey = "←"

		case key.Matches(msg, m.keys.Right):
			m.lastKey = "→"

		case key.Matches(msg, m.keys.Help):
			m.help.ShowAll = !m.help.ShowAll

		case key.Matches(msg, m.keys.Quit):
			m.quitting = true
			return m, tea.Quit

    }
  }

  // return updated model to the Tea runtime
  // not returning a command here
  return m, nil
}

func (m model) View() string {

  // header
  s := "what should we buy at the market?\n\n"

  // iter over chocies
  for i, choice := range m.choices {

    //where is cursor?
    cursor := " " // no cursor
    if m.cursor == i {
      cursor = ">" // cursor! 
    }

    // is this choice selected?
    checked := " " // not selected
    if _, ok := m.selected[i]; ok {
      checked = "⛌" // selected!
    }
  
    s += fmt.Sprintf("%s [%s] %s\n", cursor, checked, choice)
  }
  
  // setup help
  helpView := m.help.View(m.keys)
  height := 8 - strings.Count(s, "\n") - strings.Count(helpView, "\n")
  return "\n" + s + strings.Repeat("\n", height) + helpView
}

func main() {
  //                                     fullscreen without erasing history
  p := tea.NewProgram(initialModel(), tea.WithAltScreen())

  if err := p.Start(); err != nil {
    fmt.Printf("There's been an error: %v", err)
    os.Exit(1)
  }

}