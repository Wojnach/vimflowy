/*
	These keybindings do not call e.preventDefault() && e.stopPropagation()	implicitly.
	You'll have to decide when and were to do that in each binding.
*/

const transparentActionMap = 
{
	[Mode.NORMAL]: 
	{
	  'ctrl-k': e => 
	  {
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'ctrl-:': e => 
	  {
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'ctrl-;': e => 
	  {
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'ctrl-Dead': e => 
	  {
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'alt-Enter': e => 
	  {
	    var focusedItem = WF.focusedItem();
	    if(!focusedItem)
	      return;

	    focusedItem = WF.getItemById(focusedItem.getId());

	    const element = focusedItem.getElement();
	    const firstContentLink = element.getElementsByClassName('contentLink')[0]; 
	    if(firstContentLink)
	    {
	      const contentHref = firstContentLink.getAttribute("href");
	      // console.log("href: " + contentHref);
	      const strippedHref = contentHref.replace(/(^\w+:|^)\/\//, '');
	      // console.log("Stripped href: " + strippedHref);
	      const focusedItemName = focusedItem.getNameInPlainText();
	      // console.log("Name; " + focusedItemName);
	      const focusedItemNote = focusedItem.getNoteInPlainText();
	      // console.log("Note; " + focusedItemNote);
	      if(focusedItemName.includes(strippedHref) || focusedItemNote.includes(strippedHref))
	      {
	        var win = window.open(contentHref, '_blank');
	        win.focus();
	      }
	    }

	  },
	  Enter: e => 
	  {
	    const focusedItem = WF.focusedItem();
	    if(e.shiftKey && focusedItem)
	    {
	      goToInsertMode();
	      return;
	    }

	    PrevEnterItem = WF.currentItem();
	    if(focusedItem)
	    {
	      // console.log("transparent Enter (NORMAL) valid focus");
	      e.preventDefault()
	      e.stopPropagation()
	      // WF.zoomIn(focusedItem);
	      WF.zoomTo(focusedItem);
	      WF.editItemName(focusedItem);
	    }
	    else
	    {
	      // WF.zoomIn(WF.currentItem());
	      WF.zoomTo(WF.currentItem());
	      WF.editItemName(WF.currentItem());
		}

	  },
	  Backspace: e => 
	  {
	    e.preventDefault()
	    e.stopPropagation()
	    if(PrevEnterItem)
	    {
	      // console.log("trying to zoom in on prev item");
	      // console.log(PrevEnterItem);
	      // WF.zoomIn(PrevEnterItem);
	      WF.zoomTo(PrevEnterItem);
	    }
	  },
	  Escape: e => 
	  {
	    if(WF.focusedItem())
	    {
	        // console.log("transparent Escape (NORMAL)");
	        const selection = WF.getSelection();
	        if (selection !== undefined && selection.length != 0)
	        {
	          VisualSelectionBuffer = [];
	          WF.setSelection([]);
	        }

	        e.preventDefault()
	        e.stopPropagation()
	    }

	    WF.hideMessage();
	    WF.hideDialog();
	    goToNormalMode();
	  },
	  'ctrl-[': e => 
	  {
	    if(WF.focusedItem())
	    {
	        // console.log("transparent Escape (NORMAL)");
	        const selection = WF.getSelection();
	        if (selection !== undefined && selection.length != 0)
	        {
	          VisualSelectionBuffer = [];
	          WF.setSelection([]);
	        }

	        e.preventDefault()
	        e.stopPropagation()
	    }

	    WF.hideMessage();
	    WF.hideDialog();
	    goToNormalMode();
	  },
	  'g': e => 
	  {
	    const focusedItem = WF.focusedItem();
	    if(!focusedItem)
	      return;

	    const focusedItemParent = focusedItem.getParent();
	    if(!focusedItemParent)
	      return;

	    const currentOffset = state.get().anchorOffset

	    const bIsParentHomeRoot = WF.rootItem().equals(focusedItem.getParent()); 
	    if(bIsParentHomeRoot)
	    {
	      const visibleChildren = WF.currentItem().getVisibleChildren();
	      if (visibleChildren !== undefined && visibleChildren.length != 0) 
	      {
	        WF.editItemName(visibleChildren[0]);
	      }
	      else
	      {
	        WF.editItemName(focusedItemParent);
	      }
	    }
	    else
	    {
	      WF.editItemName(focusedItemParent);
	    }

	    event.preventDefault()
	    event.stopPropagation()

	    setCursorAt(currentOffset);
	  },
	  'G': e => 
	  {
		const focusedItem = WF.focusedItem();

		if(!focusedItem)
			return;

		const currentItem = WF.currentItem();
		const itemRoot = focusedItem.equals(currentItem) ? WF.currentItem() : focusedItem.getParent();
		goToListBottom(e, itemRoot);
	  },
	  'GG': e => 
	  {
		goToListBottom(e, WF.currentItem());
	  },
	  'gg': e => 
	  {
	    const currentOffset = state.get().anchorOffset
	    const bIsCurrentItemHomeRoot = WF.rootItem().equals(WF.currentItem()); 
	    if(bIsCurrentItemHomeRoot)
	    {
	      const visibleChildren = WF.currentItem().getVisibleChildren();
	      if (visibleChildren !== undefined && visibleChildren.length != 0) 
	      {
	        WF.editItemName(visibleChildren[0]);
	      }
	      else
	      {
	        WF.editItemName(WF.currentItem());
	      }
	    }
	    else
	    {
	      WF.editItemName(WF.currentItem());
	    }

	    event.preventDefault();
	    event.stopPropagation();

	    setCursorAt(currentOffset);
	  },
	  'dw': e => 
	  {
	    deleteWord(e, true);
	  },
	  'de': e => 
	  {
	    deleteWord(e, false);
	  },
	  'dn': e => 
	  {
		deleteNote(WF.focusedItem());
		e.preventDefault()
		e.stopPropagation()
	  },
	  'cw': e => 
	  {
		deleteWord(e, true);
		goToInsertMode();
	  },
	  'ce': e => 
	  {
	    deleteWord(e, false);
		goToInsertMode();
	  },
	  'cn': e => 
	  {
		changeNote(WF.focusedItem());
		e.preventDefault()
		e.stopPropagation()
	  },
	  'd$': e => 
	  {
	    deleteUntilLineEnd();
		e.preventDefault()
		e.stopPropagation()
	  },
	  'alt-H': e => 
	  {
	    enterVisualMode();
	    outdentSelection(e);
	    ExitVisualMode();
	    event.preventDefault()
	    event.stopPropagation()
	  },
	  'alt-L': e => 
	  {
	    enterVisualMode();
	    indentSelection(e);
	    ExitVisualMode();
	    event.preventDefault()
	    event.stopPropagation()
	  },
	  '<': e => 
	  {
		  if(WF.getSelection().length <= 0)
		  {
			  outdentFocusedItem(e);
		  }
		  else
		  {
			enterVisualMode();
			outdentSelection(e, true);
			ExitVisualMode();
			event.preventDefault();
			event.stopPropagation();
		  }
	  },
	  '>': e => 
	  {
		if(WF.getSelection().length <= 0)
		{
			indentFocusedItem(e);
		}
		else
		{
			enterVisualMode();
			indentSelection(e);
			ExitVisualMode();
			event.preventDefault();
			event.stopPropagation();
		}
	  },
	  Tab: e => 
	  {
	    if(e.shiftKey)
		{
			outdentSelection(e, false);
		}
	    else
		{
	    	indentSelection(e);
		}
	  },
	  'ctrl- ': e => 
	  {
	    toggleExpandAll(e);
	  },
	  'ctrl-i': e => 
	  {
		RotateSelectionPreMoveBuffer();
	  },
	  'ctrl-u': e => 
	  {
		RotateSelectionPreMoveBuffer();
	  },
	  'ctrl-b': e => 
	  {
		RotateSelectionPreMoveBuffer();
	  },
	  'ctrl-Enter': e => 
	  {
		  RotateSelectionPreMoveBuffer();
		  toggleCompletedOnSelection(e);
		  RotateSelectionPreMoveBuffer();
	  },
	  'ctrl-c': t => 
	  {
	    yankSelectedItems(t);
    	requestAnimationFrame(fixFocus);
	  },
	  'dd': e => 
	  {
	    yankSelectedItems(e.target);
		deleteSelectedItems(e.target);
	    event.preventDefault();
	    event.stopPropagation();
	  }
	},
	[Mode.VISUAL]: 
	{
	  'GG': t => 
	  {
		addSiblingsFromCurrentList(false);
		event.preventDefault();
		event.stopPropagation();
	  },
	  'gg': t => 
	  {
		addSiblingsFromCurrentList(true);
		event.preventDefault();
		event.stopPropagation();
	  },
	  'ctrl-u': e => 
	  {
		RotateSelectionPreMoveBuffer();
		goToNormalMode();
	  },
	  'ctrl-i': e => 
	  {
		RotateSelectionPreMoveBuffer();
		goToNormalMode();
	  },
	  'ctrl-b': e => 
	  {
		RotateSelectionPreMoveBuffer();
		goToNormalMode();
	  },
	  'ctrl-Enter': e => 
	  {
		  toggleCompletedOnSelection(e);
		  RotateSelectionPreMoveBuffer();
		  ExitVisualMode();
	  },
	  'ctrl- ': e => 
	  {
	    toggleExpandAll(e);
	  },
	  'alt-H': e => 
	  {
	    outdentSelection(e);
	    event.preventDefault()
	    event.stopPropagation()
	    ExitVisualMode();
	  },
	  'alt-L': e => 
	  {
	    indentSelection(e);
	    event.preventDefault()
	    event.stopPropagation()
	    ExitVisualMode();
	  },
	  '<': e => 
	  {
	    outdentSelection(e, true);
	    event.preventDefault()
	    event.stopPropagation()
	    ExitVisualMode();
	  },
	  '>': e => 
	  {
	    indentSelection(e);
	    event.preventDefault()
	    event.stopPropagation()
	    ExitVisualMode();
	  },
	  'ctrl-c': t => 
	  {
	    yankSelectedItems(t);
		goToNormalMode();
    	requestAnimationFrame(fixFocus);
	  },
	  Tab: e => 
	  {
	    if(e.shiftKey)
		{
			outdentSelection(e, false);
		}
		else
		{
	    	indentSelection(e);
		}
	    ExitVisualMode();
	  },
	  'ctrl-k': e => 
	  {
	    ExitVisualMode();
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'ctrl-:': e => 
	  {
	    ExitVisualMode();
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'ctrl-;': e => 
	  {
	    ExitVisualMode();
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  'ctrl-Dead': e => 
	  {
	    ExitVisualMode();
	    focusPreJumpToItemMenu = WF.focusedItem();
	    goToInsertMode();
	  },
	  Escape: e => 
	  {
	    if(WF.focusedItem())
	    {
	        const selection = WF.getSelection();
	        if (selection !== undefined && selection.length != 0)
	        {
	          VisualSelectionBuffer = [];
	          WF.setSelection([]);
	        }

	        e.preventDefault()
	        e.stopPropagation()
	    }

	    InitialSelectionItem = null;

	    WF.hideMessage();
	    WF.hideDialog();
		goToNormalMode();
	  }
	},
	[Mode.INSERT]: 
	{
	  Escape: e =>
	  {
	    // prevent it from focusing on the search bar
	    e.preventDefault()

	    if(!WF.focusedItem())
	    {
		  // important that we don't stop propagation
		  // when trying to escape the JumpToItemMenu
	      if(focusPreJumpToItemMenu)
	      {
			//   console.log("applying focus pre jump to item menu");
	        WF.editItemName(focusPreJumpToItemMenu);
	        focusPreJumpToItemMenu = null;
		  }
		  else
		  {
			// assuming we are focusing on the searchbar
			// in which case we'll have to stop the propagation
	      	e.stopPropagation()
		  }

	      if(!WF.focusedItem())
			WF.editItemName(WF.currentItem());

	    }
	    else
	    {
	      e.stopPropagation()
	    }

		goToNormalMode();
	  },
	  'Enter': e => 
	  {
	    // we are using the JumpToMenu to jump to the 
	    // item which we are already standing on.
	    // this means that "locationChanged" won't fire...
	    // so we'll handle it here for now.. 
	    if(!WF.focusedItem() && WF.currentItem())
	    {
	      if(focusPreJumpToItemMenu)
	      {
			//   console.log("applying focus pre jump to item menu");
	        WF.editItemName(focusPreJumpToItemMenu);
	        focusPreJumpToItemMenu = null;
	      }

	      if(!WF.focusedItem())
	        WF.editItemName(WF.currentItem());

	      goToNormalMode();
	      event.preventDefault();

	      requestAnimationFrame(fixFocus);
	    }
	  },
	  'jk': e => 
	  {
	    // guard against accidently pressing jk while in the menu 
	    if(!WF.focusedItem())
	      return;

	    goToNormalMode();

	    // remove j from under the cursor
	    const currentOffset = state.get().anchorOffset
	    WF.insertText("");
	    setCursorAt(currentOffset);
	    goToInsertMode();
	    goToNormalMode();
	    goToNormalMode();
	    setCursorAt(currentOffset);

	    // prevent k from being typed out.
	    event.preventDefault();
	  },
	  'ctrl-k': e => 
	  {
		const focusedItem = WF.focusedItem();
		if(focusedItem)
			focusPreJumpToItemMenu = focusedItem;

	    goToInsertMode();
	  },
	  'ctrl-:': e => 
	  {
		const focusedItem = WF.focusedItem();
		if(focusedItem)
			focusPreJumpToItemMenu = focusedItem;

	    goToInsertMode();
	  },
	  'ctrl-;': e => 
	  {
		const focusedItem = WF.focusedItem();
		if(focusedItem)
			focusPreJumpToItemMenu = focusedItem;

	    goToInsertMode();
	  },
	  'ctrl-Dead': e => 
	  {
		const focusedItem = WF.focusedItem();
		if(focusedItem)
			focusPreJumpToItemMenu = focusedItem;

	    goToInsertMode();
	  }
	}
}
