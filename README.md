Vimflowy: Vim shortcuts for Workflowy
=====================================

Keybindings
-----------

Disclaimer: for now normal mode blocks unsupported keystrokes without alt/ctrl/shift/meta to prevent typing in normal mode, but not to block native chrome and workflowy shortcuts. (with some exceptions, this is a work in progress)

* Normal mode
    - `j`: Move down one item
    - `k`: Move up one item
    - `h`: Move cursor left
    - `l`: Move cursor right
    - `i`: Insert before currently selected character
    - `a`: Insert after currently selected character
    - `/`: Focus the search box
    - `?`: Focus the search box
    - `o`: Create a new bullet below current line and go into insert mode
    - `O`: Create a new bullet above current line and go into insert mode
    - `0`: Move cursor to the first character of the line
    - `^`: Move cursor to the first character of the line
    - `$`: Move cursor to the last character on the line
    - `gg`: Go to top of the page
    - `g`: Go to root of the current list
    - `G`: Go to bottom of the page
    - `I`: Insert at the beginning of the line
    - `A`: Insert after the end of the line
    - `u`: Undo
    - `<Ctrl>r`: Redo
    - `<Ctrl>l`: Zoom into current list item
    - `<Ctrl>h`: Zoom out of current list
    - `dd`: remove the current bullet
    - `dw`: remove the current word
    - `Enter`: go to the beginning of next line
    - `<Alt>J`: Move the current line down
    - `<Alt>K`: Move the current line up
* insert mode
    - `<Esc>`: Enter Normal mode

Mode indicator
--------------

In the bottom left corner there is a mode indicator that shows what mode you are in currently. 
When you attempt to edit bullets that you don't have privileges to edit, the mode indicator will flash `Cannot edit this` for 1 second.

Usage tips
----------

If you're using [cvim](https://chrome.google.com/webstore/detail/cvim/ihlenndgcmojhcghmfjfneahoeklbjjh) (or any other Chrome extensions that install modal keybindings), make sure you add `http*://*.workflowy.com/*`to the excluded URLs.

It also works if you run Workflowy in Chromium's app mode: i.e. `chromium --app="https://workflowy.com"` (the extension is loaded underneath).

Installation
------------

* for chrome
  1. Clone this repo (or your fork) somewhere on your filesystem. 
  2. go to `chrome://extensions/`
  3. click 'Load unpacked extension...' button right below 'Extensions' header in the top left corner of the page
  4. point at the vimflowy repo directory
  5. ...
  6. profit

Tested on
---------

These are environment specs that this thing was used on and was usable. If you ever use it on a different environment, feel free to create a PR with your spec in this list :)

Please add items in this format: '<output of `lsb_release -a`>, Chrome <Version info from `chrome://settings/help`>'

* Ubuntu 16.04.3 LTS, Chrome Version 61.0.3163.91 (Official Build) (64-bit)
