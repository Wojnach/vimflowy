


Vimflowy: Vim shortcuts for Workflowy
=====================================

Keybindings
-----------
Unsupported keystrokes which haven't been modified by ALT, CTRL, or META will be blocked in all modes, except insert. For example `<Shift>d` will be blocked but `<Ctrl>d` or `<alt>d` will be allowed to pass through.

* Normal mode
    - `j`: Move down one item
    - `k`: Move up one item
    - `h`: Move cursor left
    - `l`: Move cursor right
    - `i`: Insert before currently selected character
    - `a`: Insert after currently selected character
    - `/`: Start search
    - `o`: Create a new bullet below current line and go into insert mode
    - `O`: Create a new bullet above current line and go into insert mode
    - `e`: move to end of word
    - `w`: move forward one word
    - `b`: move backwards 1 word
    - `0`,`B`,`^`: Move cursor to the first character of the line
    - `E`,`$`: Move cursor to the last character on the line
    - `gg`: Go to top most root item on page
    - `g`: Go to root item of the currently focused list
    - `G`: Go to the bottom of focused list
    - `GG`: Go to the bottom of current list, recursivly
    - `I`: Insert at the beginning of the line
    - `A`: Insert after the end of the line
    - `r`: replace character under cursor
    - `x`: remove character under cursor
    - `s`: remove character under cursor + insert mode
    - `S`: substitute entire line - deletes line, enters insertion mode
    - `C`: change to end of line
    - `d$`, `D`: delete to end of line
    - `u`: Undo
    - `y`,`Y`: yank (copy) focused items (and children)
    - `p`: paste yanked items below focused item
    - `P`: paste yanked items above focused item
    - `<Ctrl>r`: Redo
    - `<alt>l`: Zoom in on focused node 1 step and retain focus on that node
    - `<alt>h`: Zoom out of focused node 1 step and retain focus on that node
    - `dd`: yank and delete the current item(s)
    - `dw`: cut from cursor location to next word
    - `de`: cut from cursor location to the end of the current word
    - `dn`: delete note
    - `cw`: dw + goToInsertMode
    - `ce`: de + goToInsertMode
    - `cn`: change note == delete note + insert mode
    - `<Alt>J`: Move the current line down
    - `<Alt>K`: Move the current line up
    - `<ctrl>h`: zoom out (identical behaviour as WF zoom out - but instant)
    - `<ctrl>l`: zoom in  (identical behaviour as WF zoom in  - but instant)
    - `<ctrl>j`: Jump to node via EasyMotion
    - `V`,`v`: Enter visual mode
    - `>`,`<alt>L`,`Tab`: indent item(s)
    - `<alt>H`,`<shift>Tab`: outdent items
    - `<`: outdent items (and selected kids once the parent item hits the wall)
    - `<Alt>Enter`: will open the first URL found in the focusedItems name or note
    - `Space`, `z`: toggle expand/collapse on focusedItem
    - `<ctrl>Space`: toggle expand/collapse on all items under currentItemRoot
    - `Enter`: Zoom in on focused node - and place current item in memory
    - `Backspace`: zoom in on item which was place in memory when using 'Enter'
    - `<alt>§`, `` <alt>` ``: toggle work time counter; displaying num (8 hour) days and num (5 day) Weeks worth of tags. (use #1d, #2h, #30m tags for it to count)
    - `§`, `` ` ``: sort completed items according to time and place them at the bottom
* insert mode
    - `<jk>` : Enter Normal mode
* visual mode
    - `>`,`<alt>L`,`Tab`: indent item(s) + enter normal mode
    - `<alt>H`,`<shift>Tab`: outdent items +  enter normal mode
    - `<`: outdent items (and selected kids once the parent item hits the wall) +  enter normal mode
    - `V`,`v`,`<Esc>`: Enter normal mode
    - `y`, `Y`: yank (copy) selected items and enter normal mode
    - `d`: yank, delete selected items and enter normal mode
    - `D`: delete notes on all selected items
    - `G`: Adds the siblings below to the selection
    - `g`: Adds the siblings above to the selection
    - `GG`: Adds the ancestors below to the selection
    - `gg`: Adds the ancestors above to the selection
    - `<Alt>J`: Move the current selection down
    - `<Alt>K`: Move the current selection up
    - `u`: Undo + exit visual mode
    - `<Ctrl>r`: Redo
    - `Space`: toggle expand/collapse on focusedItem
    - `<ctrl>Space`: toggle expand/collapse on all items under currentItemRoot
* all modes
    - `<Esc>`: Enter Normal mode
        -'<Ctrl>[': also works as an alternative to Esc
    - `<Ctrl>k`,`<Ctrl>Dead`, `<Ctrl>;`, `<Ctrl>:`: Use Workflowys JumpToItemMenu
    - `<ctrl>Enter`: Toggle Completed on seletion

Mode indicator
--------------

In the bottom left corner there is a mode indicator that shows what mode you are in currently.

Rebinding keys
--------------

There is a plan to make shortcuts rebindable in the future, via the options menu - but for now you'll have to edit [keybinding.js](https://github.com/Wojnach/vimflowy/blob/master/keybindings.js) and [transparentKeybindings.js](https://github.com/Wojnach/vimflowy/blob/master/transparentKeybindings.js) if you want to rebind anything.

Usage tips
----------

If you're using [cvim](https://chrome.google.com/webstore/detail/cvim/ihlenndgcmojhcghmfjfneahoeklbjjh) (or any other Chrome extensions that install modal keybindings), make sure you add `http*://*.workflowy.com/*`to the excluded URLs.

Installation
------------

The extension is available on the [chrome web store](https://chrome.google.com/webstore/detail/vimflowy/jhoonlfajlaihdlcocigbpeacapaepng)

But you can also download and install an unofficial version:
1. Clone this repo (or your fork) somewhere on your filesystem.
2. go to `chrome://extensions/`
3. click 'Load unpacked extension...' button right below 'Extensions' header in the top left corner of the page
4. point at the vimflowy repo directory
5. refresh workflowy page

Tested on
---------

The extension has mainly been tested on nordic QWERTY keyboards running windows 10, but it should work on other keyboard configurations as well. Please report any bugs you might find at [Issues](https://github.com/Wojnach/vimflowy/issues)

<a href="https://www.buymeacoffee.com/Wojnach" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
