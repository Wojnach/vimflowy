
/*
	keybindings that implicitly always 
	call e.preventDefault() && e.stopPropagation()

	!!! Sequences, such as 'dd' are only supported in the transparentKeybinding map ATM.
*/

const actionMap = 
{
	[Mode.NORMAL]: 
	{
	  h: t => moveCursorLeft(t, offsetCalculator(state)),
	  j: target => 
	  {
	    setCursorAfterVerticalMove(offsetCalculator(state), moveCursorDown(target));
	  },
	  k: target => setCursorAfterVerticalMove(offsetCalculator(state), moveCursorUp(target)),
	  l: t => moveCursorRight(t, offsetCalculator(state)),
	  i: onlyIfProjectCanBeEdited(() => goToInsertMode()),
	  a: onlyIfProjectCanBeEdited(() => goToInsertMode(true)),
	  e: t => 
	  {
	    const focusedItem = WF.focusedItem();
	    if(!focusedItem)
	      return;

	    const split = focusedItem.getNameInPlainText().split(" ");
	    const currentOffset = state.get().anchorOffset

	    let traverseLength = 0;
	    for(let i = 0; i < split.length; ++i) 
	    {
	      traverseLength += split[i].length;
	      traverseLength += 1;

	      if(split[i] === "")
	        continue;

	      const wordEndOffset = traverseLength - 2;
	      if(wordEndOffset > currentOffset)
	      {
	        moveCursorTo(t, offsetCalculator(state), wordEndOffset);
	        return;
	      }
	    }
	  },
	  w: t => 
	  {
	    const focusedItem = WF.focusedItem();
	    if(!focusedItem)
	      return;

	    const itemName = focusedItem.getNameInPlainText();

	    var currentOffset = state.get().anchorOffset;

	    const substring_End = itemName.substring(currentOffset);
	    const split = substring_End.split(" ");

	    let traverseLength = currentOffset;
	    for(let i = 0; i < split.length; ++i) 
	    {

	      if(split[i] == "")
	      {
	        traverseLength += 1;
	        continue;
	      }

	      const wordEndOffset = traverseLength;
	      if(wordEndOffset > currentOffset)
	      {
	        moveCursorTo(t, offsetCalculator(state), wordEndOffset + 1);
	        return;
	      }

	      traverseLength += split[i].length;
	    }
	  },
	  b: t => {

	    const focusedItem = WF.focusedItem();
	    if(!focusedItem)
	      return;

	    const nameInPlainText = focusedItem.getNameInPlainText();
	    const split = nameInPlainText.split(" ");
	    const currentOffset = state.get().anchorOffset

	    let traverseLength = nameInPlainText.length - 1;
	    for(let i = split.length-1; i >= 0; --i) 
	    {
	      traverseLength -= (split[i].length - 1);
	      if(split[i] !== "" && traverseLength < currentOffset)
	      {
	        moveCursorTo(t, offsetCalculator(state), traverseLength);
	        return;
	      }
	      traverseLength -= 2;
	    }

	  },
	  o: t => 
	  {
		const focusedItem = WF.focusedItem();
		if(focusedItem)
		{
			const parentItem = focusedItem.getParent();
			const currentItem = WF.currentItem();

			// Just add item if we are focusing 
			// on the top-most-item (zoomed in)
			if(focusedItem.equals(currentItem))
			{
				WF.createItem(currentItem, 0);
			}
			else
			{
				if(focusedItem.isExpanded())
				{
					// check if the next visibling sibling is in the viewport
					const nextItem = focusedItem.getNextVisibleSibling();
					if((nextItem && !IsItemFocusable(nextItem)) || (!nextItem && !IsBottomMostChildFocusable(focusedItem)))
					{
						/*
							The item is out of range. We'll collapse the item and have the user press twice.

							note: we tried scrolling the bottom most item into view recursively 
							but it doesn't work because element.scrollIntroView() updates the 
							next frame. If we could trigger it to update immediately 
							then it would work...
						*/
						WF.collapseItem(focusedItem);
						return;
					}
				}

				const nextItemIndex = focusedItem.getPriority() + 1; 
				WF.createItem(parentItem, nextItemIndex);
			}

			goToInsertMode(false);
		}
	  },
	  O: t => 
	  {
		const focusedItem = WF.focusedItem();
		if(focusedItem)
		{
			const parentItem = focusedItem.getParent();
			const currentItem = WF.currentItem();
			if(!focusedItem.equals(currentItem))
			{
				const currentItemIndex = focusedItem.getPriority();
				WF.createItem(parentItem, currentItemIndex);
			}
			else
			{
				WF.createItem(currentItem, 0);
			}
			goToInsertMode();
		}
	  },
	  'B': t => moveCursorToStart(t, offsetCalculator(state)),
	  '0': t => moveCursorToStart(t, offsetCalculator(state)),
	  '^': t => moveCursorToStart(t, offsetCalculator(state)),
	  '$': t => moveCursorToEnd(t, offsetCalculator(state)),
	  'E': t => moveCursorToEnd(t, offsetCalculator(state)),
	  'I': onlyIfProjectCanBeEdited(t => {
	    moveCursorToStart(t, offsetCalculator(state))
	    goToInsertMode()
	  }),
	  'A': onlyIfProjectCanBeEdited(t => {
	    moveCursorToEnd(t, offsetCalculator(state))
	    goToInsertMode(true)
	  }),
	  'alt-ﬁ': t => 
	  {
		zoomInFocused();
	  },
	  'alt-l': t => 
	  {
		zoomInFocused();
	  },
	  'alt-h': t => 
	  {
		zoomOutFocused();
	  },
	  'alt-˛': t => 
	  {
		zoomOutFocused();
	  },
	  'ctrl-l': t => 
	  {
		// WF.zoomIn(WF.focusedItem());
		zoomInInstantly();
	  },
	  'ctrl-h': t => 
	  {
		// WF.zoomOut(WF.currentItem());
		zoomOutInstantly();
	  },
	  'ctrl-j': t => 
	  {
		  if(!WF.focusedItem())
		  	return;

		  InitEasyMotionMap();
	  },
	  x: t => 
	  { 
		deleteUnderCursor(t);
	  },
	  s: t => 
	  { 
		deleteUnderCursor(t);
		goToInsertMode();
	  },
	  'alt-`': t => 
	  {
	      previousTimeTagCounterMsg = "";
	      WF.hideMessage();
	      bShowTimeCounter = !bShowTimeCounter;
	  },
	  'alt-§': t => 
	  {
	      previousTimeTagCounterMsg = "";
	      WF.hideMessage();
	      bShowTimeCounter = !bShowTimeCounter;
	  },
	  'alt-¶': t => 
	  {
	      previousTimeTagCounterMsg = "";
	      WF.hideMessage();
	      bShowTimeCounter = !bShowTimeCounter;
	  },
	  '`': t => 
	  {
		  sortCompletedItemsOnFocusParent(t);
	  },
	  '§': t => 
	  {
		  sortCompletedItemsOnFocusParent(t);
	  },
	  P: t => 
	  {
	    pasteYankedItems(true);
	  },
	  p: t => 
	  {
	    pasteYankedItems(false);
	  },
	  Y: t => 
	  {
		yankSelectedItemsByMirroring();
	  },
	  y: t => 
	  {
	    yankSelectedItemsByDuplication();
	  },
	  'D': t => 
	  {
	    deleteUntilLineEnd();
	  },
	  'C': t => 
	  {
	    deleteUntilLineEnd();
		goToInsertMode(true);
	  },
	  'S': t => 
	  {
		  const focusedItem = WF.focusedItem();
		  if(focusedItem)
		  {
			WF.setItemName(focusedItem, "");
			WF.editItemName(focusedItem);
			setCursorAt(state.get().anchorOffset);
			goToInsertMode();
		  }
	  },
	  u: t => 
	  {
		const focusedItem = WF.focusedItem();

		WF.undo(); 

		if(focusedItem)
			WF.editItemName(focusedItem);

		setCursorAt(state.get().anchorOffset);
	  },
	  'ctrl-r': t => 
	  {
	    WF.redo();
	  },
	  "ctrl-'": t =>
	  {
		WF.zoomTo(WF.rootItem());
		WF.editItemName(WF.rootItem());
	  },
	  "ctrl-ä": t => 
	  {
		WF.zoomTo(WF.rootItem());
		WF.editItemName(WF.rootItem());
	  },
	  '#': t => 
	  {
		SearchWordUnderCursor();
	  },
	  z: t => 
	  {
	    toggleExpand(t);
	  },
	  ' ': t => 
	  {
	    toggleExpand(t);
	  },
	  't': t =>
	  {
		if(!WF.focusedItem())
			return;
		goToFindMode();
	  },
	  'T': t =>
	  {
		if(!WF.focusedItem())
			return;
		goToFindMode();
	  },
	  'F': t =>
	  {
		if(!WF.focusedItem())
			return;
		goToFindMode();
	  },
	  'f': t =>
	  {
		if(!WF.focusedItem())
			return;
		goToFindMode();
	  },
	  'r': t =>
	  {
		if(WF.focusedItem())
		{
			// Clearing the keyBuffer ensures that the keybufferUpdater filters
			// out unwanted chars for us during the next keypress
			// @TODO: remove this once we starting using R replace. 
			keyBuffer = [];

			goToReplaceMode();
		}
	  },
	  'v': t =>
	  {
	    // const selection = WF.getSelection();
	    // if(selection !== undefined && selection.length != 0)
	    //   ExitVisualMode(t);
		// else
		  ExitVisualMode(t);
	      enterVisualMode(t);
	  },
	  'V': t =>
	  {
	    // const selection = WF.getSelection();
	    // if(selection !== undefined && selection.length != 0)
	    //   ExitVisualMode(t);
	    // else
		  ExitVisualMode(t);
	      enterVisualMode(t);
	  },
	  'alt-J': t => 
	  {
		MoveSelectionDown(t);
	  },
	  'alt-¬': t => 
	  {
		MoveSelectionDown(t);
	  },
	  'alt-K': t => 
	  {
	    MoveSelectionUp(t);
	  },
	  'alt-º': t => 
	  {
	    MoveSelectionUp(t);
	  },
	  'alt-√': t => 
	  {
	    const selection = WF.getSelection();
	    if(selection !== undefined && selection.length !== 0)
	      MoveSelectionDown(t);
	    else
	      MoveItemDown(t);
	  },
	  'alt-j': t => 
	  {
	    const selection = WF.getSelection();
	    if(selection !== undefined && selection.length !== 0)
	      MoveSelectionDown(t);
	    else
	      MoveItemDown(t);
	  },
	  'alt-ª': t => 
	  {
	    const selection = WF.getSelection();
	    if(selection !== undefined && selection.length !== 0)
	      MoveSelectionUp(t);
	    else
	      MoveItemUp(t);
	  },
	  'alt-k': t => 
	  {
	    const selection = WF.getSelection();
	    if(selection !== undefined && selection.length !== 0)
	      MoveSelectionUp(t);
	    else
	      MoveItemUp(t);
	  },
	  'alt-≈': t => 
	  {
		RemoveTextColorFromFocusedItem();
	  },
	  'alt-0': t => 
	  {
		RemoveTextColorFromFocusedItem();
	  },
	  'alt-©': t => 
	  {
		ColorFocusedItem("red");
	  },
	  'alt-1': t => 
	  {
		ColorFocusedItem("red");
	  },
	  'alt-2': t => 
	  {
		ColorFocusedItem("orange");
	  },
	  'alt-@': t => 
	  {
		ColorFocusedItem("orange");
	  },
	  'alt-3': t => 
	  {
		ColorFocusedItem("yellow");
	  },
	  'alt-£': t => 
	  {
		ColorFocusedItem("yellow");
	  },
	  'alt-4': t => 
	  {
		ColorFocusedItem("green");
	  },
	  'alt-$': t => 
	  {
		ColorFocusedItem("green");
	  },
	  'alt-5': t => 
	  {
		ColorFocusedItem("blue");
	  },
	  'alt-∞': t => 
	  {
		ColorFocusedItem("blue");
	  },
	  'alt-6': t => 
	  {
		ColorFocusedItem("purple");
	  },
	  //'alt-§': t => 
	  //{
	  //	ColorFocusedItem("purple");
	  //},
	  'alt-7': t => 
	  {
		ColorFocusedItem("gray");
	  },
	  'alt-|': t => 
	  {
		ColorFocusedItem("gray");
	  }
	},
	[Mode.VISUAL]: 
	{
	  'G': t => 
	  {
		  addSiblingsFromInitList(false);
	  },
	  'alt-≈': t => 
	  {
		RemoveTextFromSelectedItems();
	    ExitVisualMode();
	  },
	  'alt-©': t => 
	  {
		ColorSelectedItems("red");
	  },
	  'alt-@': t => 
	  {
		ColorSelectedItems("orange");
	  },
	  'alt-£': t => 
	  {
		ColorSelectedItems("yellow");
	  },
	  'alt-$': t => 
	  {
		ColorSelectedItems("green");
	  },
	  'alt-∞': t => 
	  {
		ColorSelectedItems("blue");
	  },
	  'alt-§': t => 
	  {
		ColorSelectedItems("purple");
	  },
	  'alt-|': t => 
	  {
		ColorSelectedItems("gray");
	  },
	  'alt-0': t => 
	  {
		RemoveTextFromSelectedItems();
	    ExitVisualMode();
	  },
	  'alt-1': t => 
	  {
		ColorSelectedItems("red");
	  },
	  'alt-2': t => 
	  {
		ColorSelectedItems("orange");
	  },
	  'alt-3': t => 
	  {
		ColorSelectedItems("yellow");
	  },
	  'alt-4': t => 
	  {
		ColorSelectedItems("green");
	  },
	  'alt-5': t => 
	  {
		ColorSelectedItems("blue");
	  },
	  'alt-6': t => 
	  {
		ColorSelectedItems("purple");
	  },
	  'alt-7': t => 
	  {
		ColorSelectedItems("gray");
	  },
	  'g': t => 
	  {
		  addSiblingsFromInitList(true);
	  },
	  '`': t => 
	  {
		sortCompletedItemsOnFocusParent(t);
		ExitVisualMode();
	  },
	  '§': t => 
	  {
		sortCompletedItemsOnFocusParent(t);
		ExitVisualMode();
	  },
	  D: t => 
	  {
		var selection = WF.getSelection();
		if (selection === undefined || selection.length === 0)
			return;

		WF.editGroup(() => 
		{
			selection.forEach((item, i) => 
			{
				deleteNote(item);
			});
		});

		RotateSelectionPreMoveBuffer();

	    ExitVisualMode();
	  },
	  u: t => 
	  {
	    WF.undo(); 
	    ExitVisualMode();
	  },
	  'ctrl-r': t => 
	  {
	    WF.redo();
	  },
	  ' ': t => 
	  {
	    toggleExpand(t);
	  },
	  'j': t =>
	  {
	    visualMode_AddItemToSelection_Below(t);
	  },
	  'k': t =>
	  {
	    visualMode_AddItemToSelection_Above(t);
	  },
	  'J': t =>
	  {
	    visualMode_AddItemToSelection_Below(t);
	  },
	  'K': t =>
	  {
	    visualMode_AddItemToSelection_Above(t);
	  },
	  'd': t =>
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

	    deleteSelectedItems(t);
	    ExitVisualMode();

		// fix potential focus loss
		if (!WF.focusedItem()) 
		{
			requestAnimationFrame(fixFocus);
			WF.editItemName(WF.currentItem());
		}

	  },
	  P: t => 
	  {
		const bValidBuffer_Copies = IsBufferValid(yankItemBuffer_Copies);
		const bValidBuffer_Duplicates = IsBufferValid(yankItemBuffer_Duplicates);
		if (!bValidBuffer_Copies && !bValidBuffer_Duplicates)
			return;

		WF.editGroup(() => 
		{
			const selection = WF.getSelection();
			const lostFocusItem = WF.focusedItem();
			pasteYankedItems(true);
    		WF.editItemName(lostFocusItem);
			WF.setSelection(selection);
			yankSelectedItemsByCopy();
			deleteSelectedItems(t);
		});

	    ExitVisualMode();
	  },
	  p: t => 
	  {
		const bValidBuffer_Copies = IsBufferValid(yankItemBuffer_Copies);
		const bValidBuffer_Duplicates = IsBufferValid(yankItemBuffer_Duplicates);
		if (!bValidBuffer_Copies && !bValidBuffer_Duplicates)
			return;

		WF.editGroup(() => 
		{
			const selection = WF.getSelection();
			const lostFocusItem = WF.focusedItem();
			pasteYankedItems(false);
    		WF.editItemName(lostFocusItem);
			WF.setSelection(selection);
			yankSelectedItemsByCopy();
			deleteSelectedItems(t);
		});

	    ExitVisualMode();
	  },
	  'V': t =>
	  {
	    ExitVisualMode(t);
	    // enterVisualMode(t);
	  },
	  'v': t =>
	  {
	    ExitVisualMode(t);
	    // enterVisualMode(t);
	  },
	  'Y': t =>
	  {
		yankSelectedItemsByMirroring();
	    ExitVisualMode(t);
	  },
	  'y': t =>
	  {
	    yankSelectedItemsByDuplication();
	    ExitVisualMode(t);
	  },
	  'alt-”': t => 
	  {
	    ExitVisualMode(t);
	  },
	  'alt-M': t => 
	  {
	    ExitVisualMode(t);
	  },
	  'alt-¬': t => 
	  {
	    MoveSelectionDown(t);
	    ExitVisualMode(t);
	  },
	  'alt-J': t => 
	  {
	    MoveSelectionDown(t);
	    ExitVisualMode(t);
	  },
	  'alt-º': t => 
	  {
	    MoveSelectionUp(t);
	    ExitVisualMode(t);
	  },
	  'alt-K': t => 
	  {
	    MoveSelectionUp(t);
	    ExitVisualMode(t);
	  },
	  'alt-√': t => 
	  {
	    MoveSelectionDown(t);
	    ExitVisualMode(t);
	  },
	  'alt-j': t => 
	  {
	    MoveSelectionDown(t);
	    ExitVisualMode(t);
	  },
	  'alt-ª': t => 
	  {
	    MoveSelectionUp(t);
	    ExitVisualMode(t);
	  },
	  'alt-k': t => 
	  {
	    MoveSelectionUp(t);
	    ExitVisualMode(t);
	  }
	},
	[Mode.INSERT]: 
	{
	}
}
