/*
charm.sh

  bubbletea template
  https://github.com/charmbracelet/bubbletea-app-template

  basic bubbles
  https://github.com/charmbracelet/bubbles

  styling 
  https://github.com/charmbracelet/lipgloss

---

extras

  layout
  https://github.com/treilik/bubbleboxer

  flexbox
  https://github.com/76creates/stickers

  teacup bubbles
  https://github.com/knipferrc/teacup

  good example for teacup
  https://github.com/BetaPictoris/wiki

---

non-charm helpers

  ansi colors
  https://raw.githubusercontent.com/fidian/ansi/master/images/color-codes.png

  palette generator
  https://gka.github.io/palettes

  go cheatsheet
  http:www.devdungeon.com/content/working-files-go
*/

package main

import (
        "fmt"
  _     "io"
        "log"
  _     "os"
  _     "strings"

  _     "github.com/76creates/stickers"
  _     "github.com/charmbracelet/bubbles/help"
  _     "github.com/charmbracelet/bubbles/key"
  _     "github.com/charmbracelet/bubbles/viewport"
  tea   "github.com/charmbracelet/bubbletea"
  _     "github.com/charmbracelet/glamour"
        "github.com/charmbracelet/lipgloss"
        "github.com/knipferrc/teacup/code"
        "github.com/knipferrc/teacup/statusbar"
  _     "github.com/treilik/bubbleboxer"
)

const (
  // sidebarAddr     = "sidebar"
  // statusbarAddr   = "statusbar"
  // maincontentAddr = "maincontent"
  // statusAddr      = "status"

  // useHighPerformanceRenderer = false
)

type Bubble struct {
  statusbar statusbar.Bubble
  editor    code.Bubble
  height    int
  content   string
  title     string
  subtitle  string
  ready     bool
}

func (Bubble) Init() tea.Cmd {
  return nil
}

// create new instance of the statusbar UI
func NewStatusBar() statusbar.Bubble {
  sb := statusbar.New(
  statusbar.ColorConfig{
  Foreground: lipgloss.AdaptiveColor{Dark: "#ffffff", Light: "#ffffff"},
  Background: lipgloss.AdaptiveColor{Light: "234", Dark: "234"},
  },
  statusbar.ColorConfig{
  Foreground: lipgloss.AdaptiveColor{Light: "#ffffff", Dark: "#ffffff"},
  Background: lipgloss.AdaptiveColor{Light: "#3c3836", Dark: "#3c3836"},
  },
  statusbar.ColorConfig{
  Foreground: lipgloss.AdaptiveColor{Light: "#ffffff", Dark: "#ffffff"},
  Background: lipgloss.AdaptiveColor{Light: "#3c3836", Dark: "#3c3836"},
  },
  statusbar.ColorConfig{
  Foreground: lipgloss.AdaptiveColor{Light: "#ffffff", Dark: "#ffffff"},
  Background: lipgloss.AdaptiveColor{Light: "#6124DF", Dark: "#6124DF"},
  },
  )

  return sb
}


func (b Bubble) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
  var (
  cmd  tea.Cmd
  cmds []tea.Cmd
  )

  switch msg := msg.(type) {
  case tea.WindowSizeMsg:
  b.height = msg.Height

  footerHeight := lipgloss.Height(b.footerView())
  verticalMarginHeight := footerHeight

  if !b.ready {
    // since we're using the full viewport, we need to
    // wait until we've received the window dimensions
    // before we can init the viewport. the initial
    // dimensions come in quickly, but async, which is
    // why we wait for them here

    b.editor = code.New(true, false, lipgloss.AdaptiveColor{})
    b.editor.SetSize(msg.Width, msg.Height - verticalMarginHeight)
    // b.viewport.YPosition = 0
    // b.viewport.HighPerformanceRendering = useHighPerformanceRenderer
    // b.viewport.SetContent(b.content)
    b.editor.SetFileName("readme.md")
    b.ready = true

  } else {
    b.editor.SetSize(msg.Width, msg.Height - verticalMarginHeight)
  }

  case tea.KeyMsg:
  switch msg.String() {
  case "ctrl+c", "esq", "q":
  cmds = append(cmds, tea.Quit)
  }

  }

  b.editor, cmd = b.editor.Update(msg)
  cmds = append(cmds, cmd)

  return b, tea.Batch(cmds...)
}

func (b Bubble) View() string {
  if !b.ready {
  return "\n Initializing..."
  }
  return fmt.Sprintf("%s\n%s", b.editor.View(), b.footerView())
}

func (b Bubble) footerView() string {
  // b.statusbar.SetSize(b.viewport.Width)
  //@todo this needs to happen

  title := lipgloss.NewStyle().Foreground(lipgloss.Color("255")).Background(lipgloss.Color("234")).Bold(true).Render(" " + b.title + " ")
  subtitle := lipgloss.NewStyle().Foreground(lipgloss.Color("255")).Background(lipgloss.Color("237")).Bold(true).Render(" " + b.subtitle+ " ")

  b.statusbar.SetContent(title, subtitle, "", "✔")

  return b.statusbar.View()
}

func main() {
  // filepath := "readme.md"

  // editor := code.New(true, false, lipgloss.AdaptiveColor{})
  // editor.SetFileName(filepath)
  // editor.SetSize(b.)

  // out, err := glamour.Render(editor, "dark")
  // if err != nil {
  // log.Fatal(err)
  // }

  p := tea.NewProgram(
  Bubble{statusbar: NewStatusBar(),
  content: "",
  title:   "filepath",
  subtitle: "",
  },

  // use full size of terminal
  tea.WithAltScreen(),

  // turn on mouse support
  tea.WithMouseAllMotion(),
  )

  if err := p.Start(); err != nil {
  log.Fatal("surgery went wrong, bossman:", err)
  }
}

// func null() {
//   tree    := filetree.New()

//   sidebar   := tree
//   status   := statusbar.New()
//   maincontent := code.New()
// }
