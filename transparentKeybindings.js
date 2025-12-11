/*
	These keybindings do not call e.preventDefault() && e.stopPropagation()	implicitly.
	You'll have to decide when and were to do that in each binding.
*/

const transparentActionMap = 
{
	[Mode.NORMAL]:
	{
	  'alt-O': e =>
	  {
		// Open Jump To menu (Shift+Alt+O)
		const focusedItem = WF.focusedItem();
		if (!focusedItem) return;

		// Set flag to indicate we're in Jump To menu mode
		window._vimflowyJumpToActive = true;

		// Prepare for jump (goes to insert mode, saves focus for restoration)
		HandleJumpTo();

		// Dispatch Ctrl+K to open the Jump To menu
		setTimeout(() => {
			const ctrlKEvent = new KeyboardEvent('keydown', {
				key: 'k',
				code: 'KeyK',
				keyCode: 75,
				which: 75,
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});
			document.activeElement.dispatchEvent(ctrlKEvent);

			// Listen for location change to return to normal mode and fix focus
			const locationService = window.ioc.maybe('location');
			if (locationService) {
				const unsubscribe = locationService.onChange && locationService.onChange(() => {
					window._vimflowyJumpToActive = false;

					setTimeout(() => {
						const currentItem = WF.currentItem();
						if (currentItem && !WF.focusedItem()) {
							focusItemAndScroll(currentItem);
						}
						goToNormalMode();
					}, 50);
					if (unsubscribe) unsubscribe();
				});
			}
		}, 10);

		e.preventDefault();
		e.stopPropagation();
	  },
	  'alt-ctrl-m': e =>
	  {
		// Handle Workflowy's native Move To menu (Ctrl+Alt+M)
		const focusedItem = WF.focusedItem();
		if (!focusedItem) return;

		// Set flag to indicate we're in Move To menu mode
		window._vimflowyMoveToActive = true;

		// Go to insert mode to allow typing in the menu
		goToInsertMode();

		// Let the event propagate to Workflowy to open the menu
	  },
	  'ctrl-k': e =>
	  {
		HandleJumpTo();
	  },
	  'meta-k': e => 
	  {
		HandleJumpTo();
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
		  'ctrl-H': t => 
	  {
		if(WF.focusedItem())
		{
			WF.setSelection([WF.focusedItem()]);
		}
	  },
	  'alt-Enter': e => 
	  {
		if(e.shiftKey)
		{
			ZoomToMirroredItemsParent();
		}
		else
		{
			openFocusedItemURL();
		}
	  },
	  Enter: e => 
	  {
	    const focusedItem = WF.focusedItem();
	    if(e.shiftKey && focusedItem)
	    {
			// we want to edit a note under the bullet
			goToInsertMode();
	      	return;
	    }


	    PrevEnterItem = WF.currentItem();
	    if(focusedItem)
	    {
			// console.log("transparent Enter (NORMAL) valid focus");

			// Temp fix. Our event listeners are hooked up after WF so we can't stop the propagation atm.
			// we'll undo their command as a workaround for now
			WF.undo();

			e.preventDefault()
			e.stopPropagation()

			// WF.zoomIn(focusedItem);
			WF.zoomTo(focusedItem);
			WF.editItemName(focusedItem);
	    }
	    else
	    {
	      // Temp fix. Our event listeners are hooked up after WF so we can't stop the propagation atm.
	      // we'll undo their command as a workaround for now
	      WF.undo();

	      e.preventDefault()
	      e.stopPropagation()

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
		  WF.zoomTo(PrevEnterItem);
		}

	  },
	  'ctrl-[': e => 
	  {
		SimulateEscapeNormalMode(e);
	  },
	  Esc: e => 
	  {
		// console.log("Pressing ESC from normal mode");
		HandleEscapeNormalMode(e);
	  },
	  Escape: e => 
	  {
		// console.log("Pressing Escape from normal mode");
		HandleEscapeNormalMode(e);
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
	      if (visibleChildren !== undefined && visibleChildren.length !== 0) 
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
	  'zz': e =>
	  {
		// Scroll page so focused item is in the center
		const focusedItem = WF.focusedItem();
		if (focusedItem) {
			const element = focusedItem.getElement();
			if (element) {
				element.scrollIntoView({
					behavior: 'auto',
					block: 'center'
				});
			}
		}
		e.preventDefault();
		e.stopPropagation();
	  },
	  // 'gg': e =>
	  // {
	  //   const currentOffset = state.get().anchorOffset
	  //   const bIsCurrentItemHomeRoot = WF.rootItem().equals(WF.currentItem());
	  //   if(bIsCurrentItemHomeRoot)
	  //   {
	  //     const visibleChildren = WF.currentItem().getVisibleChildren();
	  //     if (visibleChildren !== undefined && visibleChildren.length !== 0)
	  //     {
	  //       WF.editItemName(visibleChildren[0]);
	  //     }
	  //     else
	  //     {
	  //       WF.editItemName(WF.currentItem());
	  //     }
	  //   }
	  //   else
	  //   {
	  //     WF.editItemName(WF.currentItem());
	  //   }
	  //
	  //   event.preventDefault();
	  //   event.stopPropagation();
	  //
	  //   setCursorAt(currentOffset);
	  // },
	  'ci': e => 
	  {
		e.preventDefault()
		e.stopPropagation()
	    goToInnerMode();
	  },
	  'di': e => 
	  {
		e.preventDefault()
		e.stopPropagation()
		goToInnerMode();
	  },
	  'da': e => 
	  {
		e.preventDefault()
		e.stopPropagation()
		goToAfterMode();
	  },
	  'dw': e => 
	  {
		deleteUntilWordEnd(true);
		e.preventDefault()
		e.stopPropagation()
	  },
	  'de': e => 
	  {
		deleteUntilWordEnd(false);
		e.preventDefault()
		e.stopPropagation()
	  },
	  'dn': e => 
	  {
		deleteNote(WF.focusedItem());
		e.preventDefault()
		e.stopPropagation()
	  },
	  'cw': e => 
	  {
		// // we want to stay consistent with VIM behaviour...
		// // VI changes cw to ce when you're on a non-blank char.
		// // https://vimhelp.org/motion.txt.html#WORD
		// var focusedItem = WF.focusedItem();
		// if(focusedItem)
		// {
  		// 	const itemName = focusedItem.getName();
  		// 	const currentOffset = calculateCursorOffset(false);
  		// 	const underCursorChar = itemName.charAt(currentOffset); 
		// 	if(underCursorChar != " ")
		// 	{
		// 		deleteUntilWordEnd(false);
		// 	}
		// 	else
		// 	{
		// 		deleteUntilWordEnd(true);
		// 	}
		// }

		// ...nvm
		deleteUntilWordEnd(false);

		e.preventDefault()
		e.stopPropagation()

		// is fine. Don't worry about it
		goToInsertMode(false);
		goToInsertMode(true);
		goToInsertMode(false);
		goToInsertMode(true);
	  },
	  'ce': e => 
	  {
		// @TODO: this one should consume the next word when initiated 
		// from a blank-space (or from the last letter in word)
		deleteUntilWordEnd(false);
		e.preventDefault()
		e.stopPropagation()
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
	  'alt-˘': e => 
	  {
		  OutdentFocusedItems(e);
	  },
	  'alt-ﬂ': e => 
	  {
		  IndentFocusedItems(e);
	  },
	  'alt-H': e => 
	  {
		  OutdentFocusedItems(e);
	  },
	  'alt-L': e => 
	  {
		  IndentFocusedItems(e);
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
	  'ctrl-o': e => 
	  {
		if(WF.completedVisible())
		{
			FocusOnClosestNonCompletedItem();
		}
		else 
		{
			// WF.focusedItem().getElement().scrollIntoView();
			// WF.focusedItem().getElement().scrollIntoView({
			// 	behaviour: 'auto',
			// 	block: 'nearest',
			// 	inline: 'nearest'
			// });
		}
	  },
	  'ctrl-Enter': e =>
	  {
		  RotateSelectionPreMoveBuffer();
		  toggleCompletedOnSelection(e);
		  RotateSelectionPreMoveBuffer();
	  },
	  'meta-Enter': e =>
	  {
		  RotateSelectionPreMoveBuffer();
		  toggleCompletedOnSelection(e);
		  RotateSelectionPreMoveBuffer();
	  },
	  'ctrl-c': e =>
	  {
		if(WF.focusedItem())
		{
			WF.setSelection([WF.focusedItem()]);
			CopySelectionToClipboard();
			e.preventDefault()
			e.stopPropagation()
		}
	  },
	  'ctrl-v': e =>
	  {
		// Let the browser handle ctrl-v for system clipboard paste
		// Don't prevent default - allow native paste behavior
	  },
	  'dm': e => 
	  {
		detachMirrorOnSelectedItems();
		e.preventDefault();
		e.stopPropagation();
	  },
	  'dd': e => 
	  {
		yankSelectedItemsByCopy();

		/**
		 * We need to handle pasting of subVirtual mirrors.
		 * 
		 * Data for subVirutals become invalid upon deleting
		 * the mirror. However, the virutal mirror has a reference 
		 * to the original item. 
		 * 
		 * So we'll convert all subVirutals to virtuals in order
		 * for the data to survive.
		 */
		// ReplaceSubVirutalMirrorsWithVirutalMirrors(yankItemBuffer_Duplicates);

		/**
		 * data for non virutal mirror reference won't survive deletion,
		 * so we replace that data with a copy of the original item instead.
		 */
		// ReplaceNonVirtualsWithOriginals(yankItemBuffer_Duplicates);

		deleteSelectedItems(e.target);

	    e.preventDefault();
	    e.stopPropagation();
	  }
	},
	[Mode.VISUAL]: 
	{
	  'GG': e => 
	  {
		addSiblingsFromCurrentList(false);
		event.preventDefault();
		event.stopPropagation();
	  },
	  'gg': e => 
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
	  'meta-Enter': e =>
	  {
		  toggleCompletedOnSelection(e);
		  RotateSelectionPreMoveBuffer();
		  ExitVisualMode();
	  },
	  'ctrl- ': e => 
	  {
	    toggleExpandAll(e);
	  },
	  'alt-˘': e => 
	  {
	    outdentSelection(e);
	    event.preventDefault()
	    event.stopPropagation()
	    ExitVisualMode();
	  },
	  'alt-ﬂ': e => 
	  {
	    indentSelection(e);
	    event.preventDefault()
	    event.stopPropagation()
	    ExitVisualMode();
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
	  'ctrl-c': e => 
	  {
		CopySelectionToClipboard();
		e.preventDefault()
		e.stopPropagation()
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
		HandleJumpTo();
	  },
	  'meta-k': e => 
	  {
		ExitVisualMode();
		HandleJumpTo();
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
	  'ctrl-[': e => 
	  {
		SimulateEscapeVisualMode(e);
	  },
	  Esc: e => 
	  {
		// console.log("Pressing ESC from visual mode");
		HandleEscapeVisualMode(e);
	  },
	  Escape: e => 
	  {
		// console.log("Pressing Escape from visual mode");
		HandleEscapeVisualMode(e);
	  }
	},
	[Mode.INSERT]:
	{
	  'ctrl-[': e =>
	  {
		// If Move To menu is active, let Workflowy handle escape to close the popup
		if (window._vimflowyMoveToActive) {
		  window._vimflowyMoveToActive = false;
		  // Let it propagate to close the menu, then return to normal mode
		  setTimeout(() => goToNormalMode(), 50);
		  return;
		}
		// Clear menu flags on escape
		window._vimflowyJumpToActive = false;
		SimulateEscapeInsertMode(e);
	  },
	  Esc: e =>
	  {
		// If Move To menu is active, let Workflowy handle escape to close the popup
		if (window._vimflowyMoveToActive) {
		  window._vimflowyMoveToActive = false;
		  // Let it propagate to close the menu, then return to normal mode
		  setTimeout(() => goToNormalMode(), 50);
		  return;
		}
		// Clear menu flags on escape
		window._vimflowyJumpToActive = false;
		HandleEscapeInsertMode(e);
	  },
	  Escape: e =>
	  {
		// If Move To menu is active, let Workflowy handle escape to close the popup
		if (window._vimflowyMoveToActive) {
		  window._vimflowyMoveToActive = false;
		  // Let it propagate to close the menu, then return to normal mode
		  setTimeout(() => goToNormalMode(), 50);
		  return;
		}
		// Clear menu flags on escape
		window._vimflowyJumpToActive = false;
		HandleEscapeInsertMode(e);
	  },
	  'Enter': e =>
	  {
	    // Handle Enter from Jump To menu (triggered via Shift+Alt+O)
	    if (window._vimflowyJumpToActive) {
	      e.preventDefault();
	      e.stopPropagation();
	      window._vimflowyJumpToActive = false;

	      // Handle jump to same location (locationChanged won't fire)
	      setTimeout(() => {
	        const currentItem = WF.currentItem();
	        if (currentItem) {
	          WF.editItemName(currentItem);
	        }
	        goToNormalMode();
	      }, 50);
	      return;
	    }

	    // Handle Enter from Move To menu (Ctrl+Alt+M)
	    if (window._vimflowyMoveToActive) {
	      window._vimflowyMoveToActive = false;

	      // Return to normal mode after move completes
	      setTimeout(() => {
	        const currentItem = WF.currentItem();
	        if (currentItem && !WF.focusedItem()) {
	          WF.editItemName(currentItem);
	        }
	        goToNormalMode();
	      }, 100);
	      return;
	    }

	    // we are using the JumpToMenu to jump to the
	    // item which we are already standing on.
	    // this means that "locationChanged" won't fire...
	    // so we'll handle it here for now..
	    if(!WF.focusedItem() && WF.currentItem())
	    {
	      if(focusPreJumpToItemMenu)
	      {
	        WF.editItemName(focusPreJumpToItemMenu);
	        focusPreJumpToItemMenu = null;

			if(!WF.focusedItem())
				WF.editItemName(WF.currentItem());

			event.preventDefault();
			requestAnimationFrame(fixFocus);
	      }

	      goToNormalMode();
	    }
	  },
	  'jk': e => 
	  {
		if (!OPTIONS.jkToEsc) {
			return;
		}
	    // guard against accidently pressing jk while in the menu 
		const focusedItem = WF.focusedItem();
		if(!focusedItem)
			return;

		// needed when dealing with html tags
		var extraLength = 0;
		const nodes = getNodes(focusedItem.getElement());
		for(let i = 0; i < nodes.length; ++i) 
		{
			if(!window.getSelection().containsNode(nodes[i]))
				extraLength += nodes[i].length;
			else
				// only count length up to the focused node
				break;
		}

	    goToNormalMode();

		const cursorOffsetForJ = document.getSelection().getRangeAt(0).startOffset-1; 
      	setCursorAt(cursorOffsetForJ);

		// save offset before deleting
	    const targetOffset = state.get().anchorOffset + extraLength;
		
	    // remove j from under the cursor
	    WF.insertText("");

		// move cursor to the correct offset
  		moveCursorTo(e.target, offsetCalculator(state), targetOffset);

	    // prevent k from being typed out.
	    event.preventDefault();
	  },
	  'ctrl-k': e => 
	  {
		  HandleJumpTo();
	  },
	  'meta-k': e => 
	  {
		  HandleJumpTo();
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
