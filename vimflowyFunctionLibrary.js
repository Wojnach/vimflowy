const keyFrom = event => `${event.altKey ? 'alt-': ''}${event.ctrlKey ? 'ctrl-' : ''}${event.metaKey ? 'meta-' : ''}${event.key && event.key}`

function RemoveTextFromSelectedItems()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    var currentSelection = WF.getSelection();
    if (currentSelection === undefined || currentSelection.length <= 0) 
        return;

    WF.editGroup(() => 
    {
        RemoveTextFromItems(currentSelection);
    });
}

function ColorSelectedItems(inColor)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    var currentSelection = VisualSelectionBuffer.length !== 0 
    ? VisualSelectionBuffer 
    : WF.getSelection();

    if (currentSelection === undefined || currentSelection.length <= 0) 
        return;

    WF.editGroup(() => 
    {
        // ensures that we keep focus on the items after the operation
        VisualSelectionBuffer = currentSelection;
        WF.setSelection(currentSelection);

        ColorItems(currentSelection, inColor);
    });
}

function RemoveTextFromItems(inItems)
{
    if (inItems !== undefined && inItems.length !== 0)
    {
        for (var i = 0, len = inItems.length; i < len; i++)
        {
            let itemIter = inItems[i];
            if(IsMirror(itemIter))
                itemIter = GetOriginalItem(itemIter);

            if(!itemIter)
                continue;

            var kids = itemIter.getChildren();
            if (kids !== undefined && kids.length !== 0) 
                RemoveTextFromItems(kids);

            RemoveTextColorFromItem(itemIter);
        }
    }
}

function ColorItems(inItems, inColor)
{
    if (inItems === undefined || inItems.length <= 0)
        return;

    for (var i = 0, len = inItems.length; i < len; i++)
    {
        let itemIter = inItems[i];
        if(IsMirror(itemIter))
            itemIter = GetOriginalItem(itemIter);

        if(!itemIter)
            continue;

        var kids = itemIter.getChildren();
        if (kids !== undefined && kids.length !== 0) 
            ColorItems(kids, inColor);

        ColorItem(itemIter, inColor);
    }
}

function RemoveTextColorFromFocusedItem()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    // color NAME
    if(IsFocusingOnName())
        RemoveTextColorFromItemName(focusedItem);

    // color NOTE
    if(IsFocusingOnNote())
        RemoveTextColorFromItemNote(focusedItem);
}

function RemoveTextColorFromItem(item)
{
    RemoveTextColorFromItemName(item);
    RemoveTextColorFromItemNote(item);
}

function RemoveTextColorFromItemName(item)
{
    let itemName = item.getName();
    itemName = itemName.replace(/(<span([^>]*>))/g, "");
    itemName = itemName.replace(/(<\/span>)/g, "");
    WF.setItemName(item, itemName);
}

function RemoveTextColorFromItemNote(item)
{
    let itemNote  = item.getNote();
    itemNote = itemNote.replace(/(<span([^>]*>))/g, "");
    itemNote = itemNote.replace(/(<\/span>)/g, "");
    WF.setItemNote(item, itemNote);
}

function ColorFocusedItem(inColor)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    // color NAME
    if(IsFocusingOnName())
        ColorFocusedItemName(inColor);

    // color NOTE
    if(IsFocusingOnNote())
        ColorFocusedItemNote(inColor);
}

function ColorFocusedItemName(inColor)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    ColorItemName(focusedItem, inColor);
}

function ColorFocusedItemNote(inColor)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    ColorItemNote(focusedItem, inColor);
}

function ColorItem(inItem, inColor)
{
    ColorItemName(inItem, inColor);
    ColorItemNote(inItem, inColor);
}

function ColorItemName(inItem, inColor)
{
    let itemName = inItem.getName();

    if(itemName.length === 0)
        return;

    const isColored = itemName.includes('colored c-'+inColor);
    // const isHighlighted = itemName.includes('colored bc-'+inColor);

    RemoveTextColorFromItemName(inItem);

    // if(!isHighlighted)
    // {
        itemName = inItem.getName();
        itemName = GetColoredString(itemName, inColor, isColored);
        WF.setItemName(inItem, itemName);
    // }

}
function ColorItemNote(inItem, inColor)
{
    let itemNote = inItem.getNote();

    if(itemNote.length === 0)
        return;

    const isColored = itemNote.includes('colored c-'+inColor);
    // const isHighlighted = itemNote.includes('colored bc-'+inColor);

    RemoveTextColorFromItemNote(inItem);

    // if(!isHighlighted)
    // {
        itemNote = inItem.getNote();
        itemNote = GetColoredString(itemNote, inColor, isColored);
        WF.setItemNote(inItem, itemNote);
    // }
}

function GetColoredString(StringToBePained, inColor, bHighlight = true)
{
    var wrappedString = bHighlight 
    ? '<span class="colored bc-' + inColor + '">' 
    : '<span class="colored c-' + inColor + '">';
    wrappedString += StringToBePained;
    wrappedString += '</span>'
    return wrappedString;
}

function calculateCursorOffset(bHtmlTagsIncluded = false)
{
    let currentOffset = state.get().anchorOffset

    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return currentOffset;

    // const itemName = focusedItem.getName();
    // const itemNameText = focusedItem.getNameInPlainText();
    const itemName = GetFocusedItemString();
    const itemNameText = GetFocusedItemStringInPlainText();

    // @TODO: we should probably use this instead. 
    // the ItenNames will start to differ as soon as they have a '<'
    // using the htmltags regex expression ensure that we have a pair present
    // But that needs testing... Don't have that time atm.
    // var htmlTags = itemName.match(/(<\/b>)|(<\/u>)|(<\/i>)|(<i>)|(<u>)|(<b>)/g);
    // if(htmlTags !== undefined)

    // Oh no, it has html tags, recalculate cursor offset
    if(itemNameText.length !== itemName.length)
    {
        // console.log("getName: " + itemName);
        // console.log("getPlainName: " + itemNameText);
        // console.log("htrml tags: " + htmlTags);

        // remove any html tags from the "plain text name" before we start the counting
        let ItemNameTextPreCleanupSubStringStart = itemNameText.substring(0, currentOffset+1); 
        let itemNameCleaned = ItemNameTextPreCleanupSubStringStart;
        itemNameCleaned = itemNameCleaned.replace(/(<u>)/g, "");
        itemNameCleaned = itemNameCleaned.replace(/(<\/u>)/g, "");
        itemNameCleaned = itemNameCleaned.replace(/(<i>)/g, "");
        itemNameCleaned = itemNameCleaned.replace(/(<\/i>)/g, "");
        itemNameCleaned = itemNameCleaned.replace(/(<b>)/g, "");
        itemNameCleaned = itemNameCleaned.replace(/(<\/b>)/g, "");
        const lenDiff = ItemNameTextPreCleanupSubStringStart.length - itemNameCleaned.length;
        let offsetThreshold = currentOffset - lenDiff;

        let addedOffset = 0;
        for (let i = 0; i < itemName.length; i++) 
        {
            const char_1 = itemNameCleaned.charAt(i-addedOffset);
            const char_2 = itemName.charAt(i);
            if(char_1 !== char_2)
                ++addedOffset;

            if (i - addedOffset === offsetThreshold)
                break;
        }

        currentOffset += addedOffset;
        currentOffset -= lenDiff;

        if(itemName.charAt(currentOffset) === "<")
        {
            --currentOffset;
            --addedOffset;
        }

        if(bHtmlTagsIncluded)
        {
            // cursor offset (with html tags accounted for)
            return currentOffset;
        }
        else
        {
            // cursor offset (without html tags)
            const accurateCursorOffset = currentOffset - addedOffset;
            return accurateCursorOffset;
        }

    }

    return currentOffset;
}

function deleteUntilLineEnd()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const itemName = focusedItem.getName();
    let currentOffset = calculateCursorOffset(true);

    const substring_Start = itemName.substring(0, currentOffset);
    const substring_End = itemName.substring(currentOffset);
    var finalString = substring_Start;

    // console.clear();
    // console.log("substring_Start: " + substring_Start);
    // console.log("substring_End: " + substring_End);

    // Count unclosed tags in substring_Start and closing tags needed from substring_End
    // For simple tags (b, i, u)
    var htmlTags = substring_End.match(/(<\/b>)|(<\/u>)|(<\/i>)|(<i>)|(<u>)|(<b>)/g);
    if(htmlTags !== null)
    {
        var htmlEndTags = htmlTags.join("");

        // console.log("htmlTags pre replace: " + htmlEndTags);
        htmlEndTags = htmlEndTags.replace(/(<u><\/u>)/g, "");
        // console.log("htmlEndTags post replace u: " + htmlEndTags);
        htmlEndTags = htmlEndTags.replace(/(<i><\/i>)/g, "");
        // console.log("htmlEndTags post replace i: " + htmlEndTags);
        htmlEndTags = htmlEndTags.replace(/(<b><\/b>)/g, "");
        // console.log("htmlEndTags post replace b: " + htmlEndTags);

        finalString = substring_Start.concat(htmlEndTags);
        // console.log("finalString pre replace: " + finalString);

        finalString = finalString.replace(/(<u><\/u>)/g, "");
        // console.log("finalString post replace u: " + finalString);
        finalString = finalString.replace(/(<i><\/i>)/g, "");
        // console.log("finalString post replace i: " + finalString);
        finalString = finalString.replace(/(<b><\/b>)/g, "");
        // console.log("finalString post replace b: " + finalString);
    }

    // Handle span tags (used for colored text like #tags)
    // Count unclosed <span...> tags in the start portion
    const spanOpenTags = (finalString.match(/<span[^>]*>/g) || []).length;
    const spanCloseTags = (finalString.match(/<\/span>/g) || []).length;
    const unclosedSpans = spanOpenTags - spanCloseTags;

    // Add closing </span> tags for any unclosed spans
    if (unclosedSpans > 0) {
        finalString = finalString + '</span>'.repeat(unclosedSpans);
    }

    // console.log("finalString: " + finalString);
    WF.setItemName(focusedItem, finalString);
    setCursorAt(state.get().anchorOffset);
}

function deleteWord(e, bToNextWord)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    // console.clear();

    const itemName = focusedItem.getName();
    var currentOffset = calculateCursorOffset(true);

    const substring_Start = itemName.substring(0, currentOffset);
    const substring_End = itemName.substring(currentOffset);
    const underCursorChar = itemName.charAt(currentOffset); 

    // console.log("under cursor char: " + underCursorChar);

    const bNormalCharUnderCursor = /[a-zåäöA-ZÅÄÖ0-9]/.test(underCursorChar);
    // const regexStringToUse = bNormalCharUnderCursor ? /([^a-zåäöA-ZÅÄÖ0-9])/ : /([a-zåäöA-ZÅÄÖ0-9#</>])/

    // console.log("bNormalCharUnderCursor: " + bNormalCharUnderCursor);

    var regexStringToUse;
    if(bNormalCharUnderCursor)
        regexStringToUse = /([^a-zåäöA-ZÅÄÖ0-9\_])/;
    else if(underCursorChar === " ")
        regexStringToUse = /([a-zåäöA-ZÅÄÖ0-9~@#\^\$&\*\(\)-_\+=\[\]\{\}\|\\,\.\?\\s])/
        // regexStringToUse = /([a-zåäöA-ZÅÄÖ0-9#</>])/
    else
        regexStringToUse = /([0-9~@#\^\$&\*\(\)-_\+=\[\]\{\}\|\\,\.\?]*)/
        // regexStringToUse = /([a-zåäöA-ZÅÄÖ0-9~@#\^\$&\*\(\)-_\+=\[\]\{\}\|\\,\.\?]*)/

        // console.log("regex being sused: " + regexStringToUse);

    // const regexStringToUse = bNormalCharUnderCursor 
    // ? /([^a-zåäöA-ZÅÄÖ0-9])/ 
    // : /([a-zåäöA-ZÅÄÖ0-9~@#\^\$&\*\(\)-_\+=\[\]\{\}\|\\,\.\?])/

    const splitSubstring_Start = substring_Start.split(regexStringToUse).filter(Boolean);
    const firstPartOfWord = splitSubstring_Start[splitSubstring_Start.length-1];

    const splitSubstring_End = substring_End.split(regexStringToUse).filter(Boolean);
    const lastPartOfWord = splitSubstring_End[0];

    // remove the word part from substring start
    var modifiedStringStart = "";
    if(firstPartOfWord)
    {
        if(regexStringToUse.test(underCursorChar) === regexStringToUse.test(firstPartOfWord))
            modifiedStringStart = substring_Start.substring(0, currentOffset - firstPartOfWord.length);
        else
            modifiedStringStart = substring_Start;
        // console.log("length of firstPartOfWord: " + firstPartOfWord.length);
    }

    // remove the word part from substring end
    var modifiedStringEnd = "";
    if(lastPartOfWord)
        modifiedStringEnd = substring_End.substring(lastPartOfWord.length);

    if(bToNextWord)
        modifiedStringEnd = modifiedStringEnd.trim();

    var finalstring = modifiedStringStart.concat(modifiedStringEnd);

    // console.log("calculate cursor offset: " + currentOffset);
    // console.log("substring_Start: " + substring_Start);
    // console.log("substring_End: " + substring_End);
    // console.log("splitSubstring_Start: " + splitSubstring_Start);
    // console.log("splitSubstring_End: " + splitSubstring_End);
    // console.log("firstPartOfWord: " + firstPartOfWord);
    // console.log("lastPartOfWord: " + lastPartOfWord);
    // console.log("modifiedStrStart: " + modifiedStringStart);
    // console.log("modifiedStrEnd: " + modifiedStringEnd);
    // console.log("finalstring: " + finalstring);

    var modifiedStringStartCleaned = modifiedStringStart;
    // console.log("length pre cleanup: " + modifiedStringStartCleaned.length)

    modifiedStringStartCleaned = modifiedStringStartCleaned.replace(/(<u>)/g, "");
    modifiedStringStartCleaned = modifiedStringStartCleaned.replace(/(<\/u>)/g, "");
    // console.log("mod start U: " + modifiedStringStartCleaned);

    modifiedStringStartCleaned = modifiedStringStartCleaned.replace(/(<i>)/g, "");
    modifiedStringStartCleaned = modifiedStringStartCleaned.replace(/(<\/i>)/g, "");
    // console.log("mod start i: " + modifiedStringStartCleaned);

    modifiedStringStartCleaned = modifiedStringStartCleaned.replace(/(<b>)/g, "");
    modifiedStringStartCleaned = modifiedStringStartCleaned.replace(/(<\/b>)/g, "");
    // console.log("mod start b: " + modifiedStringStartCleaned);

    // console.log("length after cleanup: " + modifiedStringStartCleaned.length)

    WF.setItemName(focusedItem, finalstring);

    // console.log("desired cursor offset: " + modifiedStringStartCleaned.length);
    moveCursorTo(e.target, offsetCalculator(state), modifiedStringStartCleaned.length);
}

function deleteUntilWordEnd(bToNextWord)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    // console.clear();

    const itemName = focusedItem.getName();
    var currentOffset = calculateCursorOffset(true);

    const substring_Start = itemName.substring(0, currentOffset);
    const substring_End = itemName.substring(currentOffset);
    const underCursorChar = itemName.charAt(currentOffset); 

    // console.log("itemName: " + itemName);
    // console.log("under cursor char: " + underCursorChar);
    // console.log("substring_Start: " + substring_Start);
    // console.log("substring_End: " + substring_End);

    const bNormalCharUnderCursor = /[a-zåäöA-ZÅÄÖ0-9]/.test(underCursorChar);
    const regexStringToUse = bNormalCharUnderCursor ? /([^a-zåäöA-ZÅÄÖ0-9\_])/ : /([a-zåäöA-ZÅÄÖ0-9</>])/

    const subStrSplit_End = substring_End.split(regexStringToUse).filter(Boolean);

    // there is nothing to delete, bail
    if (!subStrSplit_End[0])
        return;

    var modifiedStrEnd = substring_End.substring(subStrSplit_End[0].length);
    if(bToNextWord)
        modifiedStrEnd = modifiedStrEnd.trim();

    // console.log("bToNextWord: " + bToNextWord);

    var finalstring = substring_Start.concat(modifiedStrEnd);

    // console.log("bNormalCharUnderCursor" + bNormalCharUnderCursor);
    // console.log("regex being used: " + regexStringToUse);
    // console.log("subStrSplit_End: " + subStrSplit_End);
    // console.log("modifiedStrEnd: " + modifiedStrEnd);

    const bRemovedEntireWord = substring_Start.charAt(substring_Start.length-1) === ">";
    if(bRemovedEntireWord)
    {
        finalstring = finalstring.replace(/(<u><\/u>)/g, "");
        finalstring = finalstring.replace(/(<i><\/i>)/g, "");
        finalstring = finalstring.replace(/(<b><\/b>)/g, "");
    }

    // console.log("finalstring: " + finalstring);

    WF.setItemName(focusedItem, finalstring);
}

function SearchWordUnderCursor()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    // console.clear();

    const itemName = focusedItem.getNameInPlainText();
    var currentOffset = calculateCursorOffset(false);

    const underCursorChar = itemName.charAt(currentOffset); 
    const bNormalCharUnderCursor = /[a-zåäöA-ZÅÄÖ0-9#]/.test(underCursorChar);
    if(bNormalCharUnderCursor === false)
        return;

    var finalString = "";

    const prevCharOffset = currentOffset - 1;
    const standingOnFirstCharOfWord = itemName.charAt(prevCharOffset) === " "; 
    // console.log("standing on first char: " + standingOnFirstCharOfWord)
    if(prevCharOffset < 0 || standingOnFirstCharOfWord)
    {
        const substring_end = itemName.substring(currentOffset);
        const substring_end_split = substring_end.split(" ").filter(Boolean);
        // console.log("substring_End: " + substring_end);
        // console.log("substring_end_split: " + substring_end_split);
        finalString = substring_end_split[0];
    }
    else
    {
        const substring_end = itemName.substring(currentOffset);
        const substring_start = itemName.substring(0, currentOffset);
        const substring_end_split = substring_end.split(" ").filter(Boolean);
        const substring_start_split = substring_start.split(" ").filter(Boolean);
        const firstPartOfWord = substring_start_split[substring_start_split.length-1];
        const lastPartOfWord = substring_end_split[0];

        if(firstPartOfWord && lastPartOfWord)
            finalString = firstPartOfWord.concat(lastPartOfWord);
        else if(firstPartOfWord)
            finalString = firstPartOfWord;
        else if(lastPartOfWord)
            finalString = lastPartOfWord;
        else
        {
            // should never get here.
            return;
        }

        // console.log("substring_End: " + substring_end);
        // console.log("substring_Start: " + substring_start);
        // console.log("substring_end_split: " + substring_end_split);
        // console.log("substring_start_split: " + substring_start_split);
    }

    // remove HTML tags
    // finalString = finalString.replace(/(<u>)/g, "");
    // finalString = finalString.replace(/(<\/u>)/g, "");
    // finalString = finalString.replace(/(<i>)/g, "");
    // finalString = finalString.replace(/(<\/i>)/g, "");
    // finalString = finalString.replace(/(<b>)/g, "");
    // finalString = finalString.replace(/(<\/b>)/g, "");

    // console.log("finalString: " + finalString);

    WF.search(finalString);
    WF.editItemName(WF.currentItem());
}

function createMirror(itemToMirror, parentItem, priority)
{
    // toDestination is redundant here because item.data.toDestination() == item.data,
    // but they do it in their code so lets do it here as well until we figure out why 
    createdMirror = parentItem.data.toDestination().createUnder([originalItem.data.toDestination().mirrorProjectTree()], priority);
    return WF.getItemById(createdMirror[0].id);
}

function createMirrorFromMirror(mirrorToCopy, parent, prio)
{
    // console.log("creating mirror");
    var duplicatedItem;

    if (IsMirror(parent))
    {
        const itemToGetBackTo = WF.currentItem();
        const originalParentItem = GetOriginalItem(parent);

        WF.zoomTo(originalParentItem);

        var createdItem = WF.createItem(originalParentItem, prio);
        WF.setItemName(createdItem, mirrorToCopy.getName());
        WF.setItemNote(createdItem, mirrorToCopy.getNote());

        // createdItem.data.metadata = mirrorToCopy.data.metadata;

        // the duplication ensures that the new mirror becomes valid
        // duplicatedItem = WF.duplicateItem(createdItem);

        // WF.deleteItem(createdItem);

        duplicatedItem = createdItem;

        WF.zoomTo(itemToGetBackTo);
    }
    else
    {
        var createdItem = WF.createItem(parent, prio);
        WF.setItemName(createdItem, mirrorToCopy.getName());
        WF.setItemNote(createdItem, mirrorToCopy.getNote());

        // createdItem.data.metadata = mirrorToCopy.data.metadata;

        // the duplication ensures that the new mirror becomes valid
        // duplicatedItem = WF.duplicateItem(createdItem);

        // console.log("Created item: ");
        // console.log(createdItem);
        // console.log("duplicated item:");
        // console.log(duplicatedItem);

        // WF.deleteItem(createdItem);
        duplicatedItem = createdItem;
    }

    return duplicatedItem;
}

// we can take shortcuts and reduce costs if we know that
// the item chain doesn't contain any 'completed' items
function createItemFromCompletelessItem(itemToCopy, parent, prio)
{
    if(!parent)
        return;

    if(itemToCopy.equals(parent))
        return;

    if (IsMirror(itemToCopy) && IsItemVirutalRoot(itemToCopy))
        return createMirror(itemToCopy, parent, prio);

    const focusedItem = WF.focusedItem();
    const focusParent = focusedItem ? focusedItem.getParent() : null;

    var originalParent = parent;
    if (IsMirror(parent))
        originalParent = GetMirroredItem(parent);

    var createdItem = WF.createItem(originalParent, prio);

    WF.setItemName(createdItem, itemToCopy.getName());
    WF.setItemNote(createdItem, itemToCopy.getNote());

    // creating mirrored items recursively requires their parent to be the original item
    // (needed when yanking and pasting mirrored items within a mirror)
    if (IsMirror(createdItem))
        createdItem = GetMirroredItem(createdItem);

    var kids = itemToCopy.getChildren();
    if (kids !== undefined && kids.length !== 0) 
    {
        for(var i=0, len=kids.length; i < len; i++)
        {
            createItemFromCompletelessItem(
                kids[i],
                createdItem,
                kids[i].getPriority()
            ); 
        }
    }

    // apply expand/collapse after we are done with the kids
    WF.editItemName(createdItem);
    if(itemToCopy.isExpanded())
        WF.expandItem(createdItem);
    else
        WF.collapseItem(createdItem);

    // fix focus loss problem when collapsing
    if(!WF.focusedItem())
    {
        requestAnimationFrame(fixFocus);
        WF.editItemName(focusParent);
        if(!WF.focusedItem())
        {
            WF.editItemName(WF.currentItem());
        }
    }

    return createdItem;
}

function createItemFrom(itemToCopy, parent, prio)
{
    if(!parent)
        return;

    if(itemToCopy.equals(parent))
        return;

    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    if (IsMirror(itemToCopy) && IsItemVirutalRoot(itemToCopy))
        return createMirror(itemToCopy, parent, prio);

    const focusParent = focusedItem.getParent();

    // always expand the parent in case we might be creating
    // completed items down the recursive chain.
    // const bWasParentExpanded = parent.isExpanded();
    // WF.expandItem(parent);

    var originalParent = parent;
    if (IsMirror(parent))
        originalParent = GetMirroredItem(parent);

    var createdItem = WF.createItem(originalParent, prio);

    WF.setItemName(createdItem, itemToCopy.getName());
    WF.setItemNote(createdItem, itemToCopy.getNote());

    // creating mirrored items recurisvely requires their parent to be the original item
    // (needed when yanking and pasting mirrored items within a mirror)
    if (IsMirror(createdItem))
        createdItem = GetMirroredItem(createdItem);

    // Always expand before dealing with the kids.
    // Close afterwards, if needed.
    // WF.expandItem(createdItem);

    if(itemToCopy.isExpanded())
        WF.expandItem(createdItem);

    if(itemToCopy.isCompleted())
        WF.completeItem(createdItem);

    var kids = itemToCopy.getChildren();
    if (kids !== undefined && kids.length !== 0) 
    {
        for(var i=0, len=kids.length; i < len; i++)
        {
            createItemFrom(
                kids[i],
                createdItem,
                kids[i].getPriority()
            ); 
        }
    }

    // // collapse it after we are done with the creation of the kids
    // if(!itemToCopy.isExpanded())
    // {
    //   WF.editItemName(createdItem);
    //   WF.collapseItem(createdItem);
    // }

    // // close parent once we are done with the kids
    // if(!bWasParentExpanded)
    // {
    //   WF.editItemName(parent);
    //   WF.collapseItem(parent);
    // }

    // fix focus loss problem when collapsing
    if(!WF.focusedItem())
    {
        requestAnimationFrame(fixFocus);
        WF.editItemName(focusParent);
        if(!WF.focusedItem())
        {
            WF.editItemName(WF.currentItem());
        }
    }

    return createdItem;
}

function IsBufferValid(InBufferToQuery)
{
    if (InBufferToQuery === undefined)
        return false;

    if (InBufferToQuery.length === 0)
        return false;

    if (InBufferToQuery[0] === null)
        return false;

    if (InBufferToQuery[0] === undefined)
        return false;

    return true;
}

function pasteYankedItems(bAboveFocusedItem)
{
    if (IsBufferValid(yankItemBuffer_Copies))
        pasteYankedItems_Copies(bAboveFocusedItem);
    else if (IsBufferValid(yankItemBuffer_Duplicates))
        pasteYankedItems_Duplicates(bAboveFocusedItem);
}

// assumes that we've checked for buffer validity outside
function pasteYankedItems_Copies(bAboveFocusedItem)
{
    var focusedItem = WF.focusedItem();

    var parentItem = focusedItem.getParent();
    if(parentItem === null)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
    {
        // @TODO: this is buggy. Needs testing before we allow this
        // parentItem = currentItem;
        return;
    }

    // (editgroup records this operation for later use. I.e WF.Undo() or WF.Redo())
    WF.editGroup(() => 
    {
        var pastePriority = bAboveFocusedItem ? focusedItem.getPriority() : focusedItem.getPriority() + 1;

        // !!! this array contains the 'data' structure which will be 
        // accessible on the item object -- not the actual item!
        var createdDataContainer = parentItem.data.createUnder(yankItemBuffer_Copies, pastePriority);

        // fix potential focus loss
        if (!WF.focusedItem()) 
        {
            requestAnimationFrame(fixFocus);
            WF.editItemName(WF.currentItem());
            focusedItem = WF.focusedItem();
        }

        // focus on top most pasted item
        if (bAboveFocusedItem) 
        {
            const newKids = parentItem.getChildren();
            const topMostPastedItemIndex = focusedItem.getPriority() - createdDataContainer.length;
            WF.editItemName(newKids[topMostPastedItemIndex]);
        }
        else 
        {
            WF.editItemName(focusedItem.getNextVisibleSibling());
        }

        // yank the items we just pasted. This will allow us to spamm paste. 
        // We re-yank the items because we need to generate 
        // unique ids for every new item.
        var pastedItems = [];
        for (var i = 0, len = createdDataContainer.length; i < len; i++)
        {
            var pastedItem = WF.getItemById(createdDataContainer[i].id); 
            if(!pastedItem)
            {
                console.warn("failed to yank item recently pasted item!");
                continue;
            }

            pastedItems.push(pastedItem);
        }
        WF.setSelection(pastedItems);

        yankSelectedItemsByCopy();
    });

    // fix potential focus loss
    if (!WF.focusedItem()) 
    {
        requestAnimationFrame(fixFocus);
        WF.editItemName(WF.currentItem());
    }
}

// assumes that we've checked for buffer validity outside
function pasteYankedItems_Duplicates(bAboveFocusedItem)
{
    var focusedItem = WF.focusedItem();

    var parentItem = focusedItem.getParent();
    if(parentItem === null)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
    {
        // @TODO: this is buggy. Needs testing before we allow this
        // parentItem = currentItem;
        return;
    }

    var bSuccessfulPaste = true;

    // (editgroup records this operation for later use. I.e WF.Undo() or WF.Redo())
    WF.editGroup(() => 
    {
        var createdItems = [];
        for (var i = 0, len = yankItemBuffer_Duplicates.length; i < len; i++) 
        {
            var createdItem = WF.duplicateItem(yankItemBuffer_Duplicates[i]);

            // remove copy tag
            const createdItemName = createdItem.getName();
            const potentialCopyTag = createdItemName.substring(createdItemName.length - 6, createdItemName.length);
            if(potentialCopyTag === " #copy")
            {
                const nameWithoutCopyTag = createdItemName.substring(0, createdItemName.length - 6);
                WF.setItemName(createdItem, nameWithoutCopyTag);
            }

            createdItems.push(createdItem);
        }

        if(ContainsInvalidItem(createdItems))
        {
            bSuccessfulPaste = false;

            // remove stale references 
            createdItems = createdItems.filter(Boolean);
        }

        if(createdItems.length > 0)
        {
            if(focusedItem.equals(WF.currentItem()))
                WF.moveItems(createdItems, focusedItem, 0);
            else if(bAboveFocusedItem)
                WF.moveItems(createdItems, parentItem, focusedItem.getPriority());
            else
                WF.moveItems(createdItems, parentItem, focusedItem.getPriority()+1);
        }

        // fix potential focus loss
        if (!WF.focusedItem()) 
        {
            requestAnimationFrame(fixFocus);
            WF.editItemName(WF.currentItem());
        }

        // focus on top most pasted item
        if(bAboveFocusedItem)
        {
            const newKids= focusedItem.getParent().getChildren();
            const topMostPastedItemIndex = focusedItem.getPriority() - createdItems.length;
            WF.editItemName(newKids[topMostPastedItemIndex]);
        }
        else
        {
            WF.editItemName(focusedItem.getNextVisibleSibling());
        }

    });

    // fix potential focus loss
    if (!WF.focusedItem()) 
    {
        requestAnimationFrame(fixFocus);
        WF.editItemName(WF.currentItem());
    }

    // might fail due to collapse animations
    if(bSuccessfulPaste === false)
    {
        console.warn("unsuccessful paste due to collapse animations taking to long");
        WF.undo();
        if(!WF.focusedItem())
        {
            requestAnimationFrame(fixFocus);
            WF.editItemName(WF.currentItem());
        }
    }
}

function getChildOfCurrentItem(itemToQuery)
{
    const currentItem = WF.currentItem();

    if(currentItem.equals(itemToQuery.getParent()))
        return itemToQuery;

    const ancestors = itemToQuery.getAncestors();
    var i = ancestors.length; 
    while(i--)
    {
        if(ancestors[i].getParent() && ancestors[i].getParent().equals(currentItem))
            return ancestors[i];
    }
    return null;
}

function toggleExpand(t)
{
    const focusedItem = WF.focusedItem();
    if(focusedItem === null)
        return;

    // expansion/collapse isn't supported by WF when searching
    // Re-enabled to test if still buggy:
    // if(WF.currentSearchQuery() !== null)
    //     return;

    const currentItem = WF.currentItem();

    if(focusedItem && focusedItem.equals(currentItem))
        return;

    if(focusedItem.isExpanded())
        WF.collapseItem(focusedItem);
    else
        WF.expandItem(focusedItem);
}

function toggleExpandAll(e)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
    {
        // console.log("focus loss");
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    // Let the workflowy binding handle it. 
    // it uses expandOrCollapseAllDescendants() 
    // which we can't call upon atm
    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
    {
        // console.log("let workflowy handle it");
        return;
    }
    else
    {
        e.preventDefault();
        e.stopPropagation();
    }

    // expansion/collapse isn't supported by WF when searching
    // Re-enabled to test if still buggy:
    // if(WF.currentSearchQuery() !== null)
    //     return;

    const focusedItemParent = focusedItem.getParent();
    if(!focusedItemParent)
    {
        // console.log("no parent?");
        return;
    }

    const children = focusedItemParent.getVisibleChildren();
    // const children = currentItem.getVisibleChildren();
    if (children === undefined || children.length === 0)
        return;

    var bExpandAll = false;

    const focusKids = focusedItem.getVisibleChildren(); 
    if(focusKids !== undefined && focusKids.length !== 0)
    {
        bExpandAll = !focusedItem.isExpanded();
    }
    else
    {
        var numExpanded = 0;
        var numCollapsed = 0;

        for (var i = 0, len = children.length; i < len; i++)
        {
            const itemKids = children[i].getVisibleChildren();
            const bHasKids = itemKids !== undefined && itemKids.length !== 0;
            if(bHasKids)
            {
                if (children[i].isExpanded())
                    ++numExpanded;
                else
                    ++numCollapsed;
            }
        }

        // none of the items have any kids => nothing to expand or collapse
        if(numExpanded === 0 && numCollapsed === 0)
            return;

        if(numExpanded === 0)
            bExpandAll = true;
        else if(numCollapsed === 0)
            bExpandAll = false;
        else
        {    
            bExpandAll = numExpanded > numCollapsed;
        }

    }

    WF.editGroup(() => 
    {
        for (var i = 0, len = children.length; i < len; i++)
        {
            if(bExpandAll)
                WF.expandItem(children[i]);
            else
                WF.collapseItem(children[i]);
        }
    });

    WF.editItemName(focusedItem);
    
    // fix focus loss problem when collapsing
    if(!WF.focusedItem())
    {
        // console.log("focus loss after collapsing");
        requestAnimationFrame(fixFocus);
        WF.editItemName(focusedItemParent);
        if(!WF.focusedItem())
        {
            WF.editItemName(currentItem);
        }
    }

}

function enterVisualMode(t)
{
        var focusedItem = WF.focusedItem();

        if(focusedItem === null)
            return;

        const currentItem = WF.currentItem();

        const bFocusIsCurrent = focusedItem.equals(currentItem);
        if(bFocusIsCurrent)
        {
            const visibleKids = focusedItem.getVisibleChildren();
            if(!visibleKids || visibleKids.length === 0)
                return;

            WF.editItemName(visibleKids[0]);
            focusedItem = WF.focusedItem();
        }

        var currentSelection = WF.getSelection();
        if(!containsItem(currentSelection, focusedItem))
            currentSelection.push(focusedItem);

        InitialSelectionItem = focusedItem;
        VisualSelectionBuffer = currentSelection;
        WF.setSelection(currentSelection);

        goToVisualMode();
}

function MoveItemDown(t)
{
        const focusedItem = WF.focusedItem();
        if (!focusedItem)
            return;

        const nextItem = focusedItem.getNextVisibleSibling();
        if(nextItem === null)
            return;

        const nextNextItem = nextItem.getNextVisibleSibling();
        if(nextNextItem !== null)
        {
            WF.editItemName(nextNextItem);
            if(focusedItem.equals(WF.focusedItem()) && nextItem.isExpanded() && WF.currentSearchQuery() === null)
                    WF.collapseItem(nextItem);
            WF.editItemName(focusedItem);
        }

        // console.log("nextItem: " + nextItem.getNameInPlainText());

        const parentItem = nextItem.getParent();
        WF.moveItems([nextItem], parentItem, focusedItem.getPriority());
        setCursorAt(state.get().anchorOffset);
}

function MoveItemUp(t)
{
        const focusedItem = WF.focusedItem();
        if (!focusedItem)
            return;

        const prevItem = focusedItem.getPreviousVisibleSibling();
        if(prevItem === null)
            return;

        // Move the prevItem down instead of moving focusedItem up
        // This keeps focus more reliably on empty bullets with images
        const parentItem = prevItem.getParent();
        WF.moveItems([prevItem], parentItem, focusedItem.getPriority() + 1);

        // Re-establish focus on the item we're moving
        WF.editItemName(focusedItem);
        setCursorAt(state.get().anchorOffset);
}

function addKidsRecursively(itemContainer, item, bOnlyExpanded = true)
{
    if (!item)
        return;

    // hmmm performance...
    // if (!containsItem(itemContainer, item))
    itemContainer.push(item); 

    if (bOnlyExpanded && !item.isExpanded())
        return;

    let kids = item.getChildren();
    if (kids !== undefined && kids.length !== 0) 
    {
        for (var i = 0, len = kids.length; i < len; i++)
        {
            addKidsRecursively
            (
                itemContainer,
                kids[i],
                bOnlyExpanded
            );
        }
    }
}

function toggleCompletedOnSelection(e)
{
    let selection = WF.getSelection();
    if (selection === undefined || selection.length === 0) 
        return;

    e.preventDefault()
    e.stopPropagation()

    let numCompleted = 0;
    let numUncompleted = 0;

    for (var i = 0, len = selection.length; i < len; i++)
    {
        if(selection[i].isCompleted())
            ++numCompleted;
        else
            ++numUncompleted;
    }
    
    let bCompleteAll = false;
    if(numCompleted === 0)
        bCompleteAll  = true;
    else if(numUncompleted === 0)
        bCompleteAll = false;
    else
    {    
        bCompleteAll = numCompleted > numUncompleted;
    }

    // add all visible kids to the selection
    for (var i = 0, len = selection.length; i < len; i++)
    {
        addKidsRecursively(
            selection,
            selection[i],
            true
        );
    }

    WF.editGroup(() => 
    {
        for (var i = 0, len = selection.length; i < len; i++)
        {
            if(selection[i].isCompleted() !== bCompleteAll)
                WF.completeItem(selection[i]);
        }
    });
}

function RotateSelectionPreMoveBuffer()
{
        var selection = WF.getSelection();
        if (selection === undefined || selection.length === 0) 
            selection = SelectionPreMove;

        if (selection !== undefined && selection.length !== 0)
            SelectionPreMove = selection;
}

function MoveSelectionDown(t)
{
    var selection = WF.getSelection();
    if (selection === undefined || selection.length === 0) 
        selection = SelectionPreMove;

    if (selection !== undefined && selection.length !== 0)
    {
        SelectionPreMove = selection;

        const nextItem = selection[selection.length-1].getNextVisibleSibling();
        if(nextItem === null)
            return;

        const parentItem = nextItem.getParent();

        // collapse the Item inbetween us and the destination
        // if we can't "see" far enough to remain in focus
        const nextNextItem = nextItem.getNextVisibleSibling();
        if(nextNextItem !== null && nextItem.getChildren().length !== 0 && nextItem.isExpanded())
        {
            const focusedItem = WF.focusedItem();
            WF.editItemName(nextNextItem);
            if(focusedItem.equals(WF.focusedItem()) && WF.currentSearchQuery() === null)
            {
                WF.collapseItem(nextItem);
            }
            WF.editItemName(focusedItem);
        }

        WF.editGroup(() => 
        {
            WF.moveItems(selection, parentItem, nextItem.getPriority() + 1);
        });

    }
    else
    {
        const focusedItem = WF.focusedItem();
        if (!focusedItem)
            return;

        const nextItem = focusedItem.getNextVisibleSibling();
        if(nextItem)
        {
            // collapse the Item inbetween us and the destination
            // if we can't "see" far enough to remain in focus
            const nextNextItem = nextItem.getNextVisibleSibling();
            if(nextNextItem !== null && nextItem.getChildren().length !== 0 && nextItem.isExpanded())
            {
                WF.editItemName(nextNextItem);
                if(focusedItem.equals(WF.focusedItem()) && WF.currentSearchQuery() === null)
                {
                    WF.collapseItem(nextItem);
                }
                WF.editItemName(focusedItem);
            }

            const parentItem = nextItem.getParent();
            WF.moveItems([nextItem], parentItem, focusedItem.getPriority());
        }
    }

    setCursorAt(state.get().anchorOffset);
}

function MoveSelectionUp(t)
{
    var selection = WF.getSelection();
    if (selection === undefined || selection.length === 0) 
        selection = SelectionPreMove;

    if (selection !== undefined && selection.length !== 0)
    {
        SelectionPreMove = selection;

        const prevItem = selection[0].getPreviousVisibleSibling();
        if(prevItem === null)
            return;

        const parentItem = prevItem.getParent();

        WF.editGroup(() => 
        {
            WF.moveItems(selection, parentItem, prevItem.getPriority());
        });
    }
    else
    {
        const focusedItem = WF.focusedItem();
        if (!focusedItem)
            return;

        const prevItem = focusedItem.getPreviousVisibleSibling();
        if(prevItem)
        {
            // Mirror MoveSelectionDown logic: move the prevItem down instead of moving focusedItem up
            // This keeps focus more reliably on empty bullets with images
            const parentItem = prevItem.getParent();
            WF.moveItems([prevItem], parentItem, focusedItem.getPriority() + 1);

            // Re-establish focus on the item we're moving
            WF.editItemName(focusedItem);
        }
    }

    setCursorAt(state.get().anchorOffset);
}

function IsWithinCompletedAncestorItemChain(itemToQuery)
{
    let itemsToCheck = itemToQuery.getAncestors();
    var i = itemsToCheck.length;
    while(i--)
    {
        if(itemsToCheck[i].isCompleted())
            return true;
    }

    return false;
}

function FindTopMostCompletedAncestorItem(itemToQuery)
{
    // console.log("checking: ");

    let itemsToCheck = itemToQuery.getAncestors();
    let closestItem = itemsToCheck[0];
    for (let i = 0, len = itemsToCheck.length; i < len; i++)
    {
        // console.log(itemsToCheck[i].getNameInPlainText());

        closestItem = itemsToCheck[i];

        if(itemsToCheck[i].isCompleted())
            break;
    }

    return closestItem;
}

function FocusOnClosestNonCompletedItem()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    if(IsWithinCompletedAncestorItemChain(focusedItem))
    {
        const ancestorItem = FindTopMostCompletedAncestorItem(focusedItem);

        // console.log("candidate: ");
        // console.log(ancestorItem.getNameInPlainText());

        const kids = ancestorItem.getParent().getChildren();
        var i = ancestorItem.getPriority();
        while(i--)
        {
            if(!kids[i].isCompleted())
            {
                WF.editItemName(kids[i]);
                setCursorAt(state.get().anchorOffset);
                return;
            }
        }

        WF.editItemName(ancestorItem);
        setCursorAt(state.get().anchorOffset);
        return;
    }

    if(!focusedItem.isCompleted())
        return;

    // lets check the upper siblings
    var iterParentItem = focusedItem.getParent();
    const siblings = iterParentItem.getChildren();
    var i = focusedItem.getPriority();
    while(i--)
    {
        if(!siblings[i].isCompleted())
        {
            WF.editItemName(siblings[i]);
            setCursorAt(state.get().anchorOffset);
            return;
        }
    }

    WF.editItemName(iterParentItem);
    setCursorAt(state.get().anchorOffset);
}

function yankSelectedItemsByMirroring()
{
    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
        return;

    var tempYankBuffer = [WF.focusedItem()];

    const selection = WF.getSelection();
    if (selection !== undefined && selection.length !== 0) 
        tempYankBuffer = selection;
    
    // only allow one buffer to be valid when yanking
    yankItemBuffer_Copies = [];
    yankItemBuffer_Duplicates = [];

    for(var i=0, len=tempYankBuffer.length; i < len; i++)
    {
        if(!tempYankBuffer[i])
            continue;
        
        // will generate mirror or duplicate item data depending on the type of item being yanked
        yankItemBuffer_Copies.push(tempYankBuffer[i].data.mirrorProjectTree());
    }
}

function yankSelectedItemsByCopy()
{
    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
        return;

    var tempYankBuffer = [WF.focusedItem()];

    const selection = WF.getSelection();
    if (selection !== undefined && selection.length !== 0) 
        tempYankBuffer = selection;
    
    // only allow one buffer to be valid when yanking
    yankItemBuffer_Copies = [];
    yankItemBuffer_Duplicates = [];

    for(var i=0, len=tempYankBuffer.length; i < len; i++)
    {
        if(!tempYankBuffer[i])
            continue;
        
        // will generate mirror or duplicate item data depending on the type of item being yanked
        yankItemBuffer_Copies.push(tempYankBuffer[i].data.copyProjectTree());
    }
}

function yankSelectedItemsByDuplication()
{
    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
        return;
    
    // only allow one buffer to be valid when yanking
    yankItemBuffer_Copies = [];
    yankItemBuffer_Duplicates = [];

    const selection = WF.getSelection();
    if (selection !== undefined && selection.length !== 0) 
        yankItemBuffer_Duplicates = selection;
    else 
        yankItemBuffer_Duplicates = [WF.focusedItem()];
}

function yankSelectedItems_DEPRECATED(t)
{
    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
        return;

    const selection = WF.getSelection();
    if (selection !== undefined && selection.length !== 0) 
        yankItemBuffer_Duplicates = selection;
    else 
        yankItemBuffer_Duplicates = [WF.focusedItem()];
}

function detachMirrorOnSelectedItems()
{
    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const currentItem = WF.currentItem();
    if(focusedItem.equals(currentItem))
        return;

    var currentSelection = [WF.focusedItem()];

    const selection = WF.getSelection();
    if (selection !== undefined && selection.length !== 0) 
        currentSelection = selection;

    WF.editGroup(() => 
    {
        for(var i=0, len=currentSelection.length; i < len; i++)
        {
            if(!currentSelection[i])
                continue;

            // refocus on the item
            const newItemData = currentSelection[i].data.unmirror();
            const newItem = WF.getItemById(newItemData.id);
            WF.editItemName(newItem);
        }
    });

    // fix potential focus loss
    if (!WF.focusedItem()) 
    {
        requestAnimationFrame(fixFocus);
        WF.editItemName(WF.currentItem());
    }

}

function ReplaceNonVirtualsWithOriginals(itemContainer)
{
    console.warn("Using Deprecated function which will be deleted in a future update");
    for (i = itemContainer.length-1; i >= 0; i--) 
    {
        if (IsMirror(itemContainer[i]) && !IsItemVirutalRoot(itemContainer[i]))
        {
            itemContainer[i] = GetOriginalItem(itemContainer[i]);
        }
    }
}

function ReplaceSubVirutalMirrorsWithVirutalMirrors(itemContainer)
{
    console.warn("Using Deprecated function which will be deleted in a future update");
    for (i = itemContainer.length-1; i >= 0; i--) 
    {
        if (IsMirror(itemContainer[i]))
        {
            while(IsItemVirutalSubRoot(itemContainer[i]))
            {
                itemContainer[i] = GetMirroredItem(itemContainer[i]);
            }
        }
    }
}

function ReplaceMirroredItems(itemContainer)
{
    for (i = itemContainer.length-1; i >= 0; i--) 
    {
        if (IsMirror(itemContainer[i]))
        {
            itemContainer[i] = GetMirroredItem(itemContainer[i]);
        }
    }
}

// get original item from mirrors
function GetOriginalItem(itemToQuery)
{
    var item = itemToQuery;
    while(IsMirror(item))
        item = GetMirroredItem(item);
    return item;
}

// is original item + other items have mirrored it
function IsBeingMirrored(itemToQuery)
{
    if(!itemToQuery)
        return false;

    if(!itemToQuery.data)
        return false;

    if(!itemToQuery.data.metadata)
        return false;

    if(itemToQuery.data.metadata.virtualRootIds === undefined)
        return false;

    for (key in itemToQuery.data.metadata.virtualRootIds) 
    {
        if (itemToQuery.data.metadata.virtualRootIds.hasOwnProperty(key))
        {
            return true;
        }
    }

    return false;
}

// get original item from mirror
function GetMirroredItem(mirror)
{
    return WF.getItemById(mirror.data.metadata.originalId);
}
function IsMirrorData(itemDataToQuery)
{
    if (!itemDataToQuery)
        return false;

    if (!itemDataToQuery.metadata)
        return false;

    return itemDataToQuery.metadata.originalId !== undefined;
}

function IsMirror(itemToQuery)
{
    if(!itemToQuery)
        return false;

    if(!itemToQuery.data)
        return false;

    // return itemToQuery.data.isMirror();

    if(!itemToQuery.data.metadata)
        return false;

    return itemToQuery.data.metadata.originalId !== undefined;
}

// get original ID from mirror
function GetMirroredItemID(itemToQuery)
{
    if(!itemToQuery)
        return;

    if(!itemToQuery.data)
        return;

    if(!itemToQuery.data.metadata)
        return;

    return itemToQuery.data.metadata.originalId;
}

function IsItemVirutalRoot(itemToQuery)
{

}

function IsItemVirutalRoot(itemToQuery)
{
    if(!itemToQuery)
        return false;

    if(!itemToQuery.data)
        return false;

    if(!itemToQuery.data.metadata)
        return false;

     return itemToQuery.data.metadata.isVirtualRoot !== undefined;
}

function IsItemVirutalSubRoot(itemToQuery)
{
    if(!itemToQuery)
        return false;

    if(!itemToQuery.data)
        return false;

    if(!itemToQuery.data.metadata)
        return false;

    if(!itemToQuery.data.metadata.mirror)
        return false;

     return itemToQuery.data.metadata.mirror.isMirrorRoot !== undefined;
    //  return itemToQuery.data.metadata.isVirtualSubRoot !== undefined;
}

function ExitVisualMode(t)
{
    InitialSelectionItem = null;
    VisualSelectionBuffer = [];
    WF.setSelection([]);
    goToNormalMode();
}

function indentSelection(e)
{
    var selection = VisualSelectionBuffer.length !== 0
        ? VisualSelectionBuffer
        : WF.getSelection();

    if (selection === undefined || selection.length === 0)
        selection = SelectionPreMove;

    if (selection === undefined || selection.length === 0)
        return;

    var prio = 0;
    var newParentItem = null;
    newParentItem = selection[0].getPreviousVisibleSibling();
    if(newParentItem)
    {
        const kids = newParentItem.getChildren(); 
        if(kids.length !== 0)
            prio = kids[kids.length-1].getPriority()+1;
    }

    SelectionPreMove = selection;

    if(newParentItem === null || newParentItem === undefined)
        return;

    const currentOffset = state.get().anchorOffset
    WF.editItemName(newParentItem);

    WF.editGroup(() => 
    {
        WF.moveItems(selection, newParentItem, prio);
        VisualSelectionBuffer = selection;
        WF.setSelection(selection);

        // @TODO: this will only work if the expansion is instant
        // if(newParentItem.getChildren().length !== 0 && !newParentItem.isExpanded())
        //   WF.expandItem(newParentItem);

    });

    // we need to focus on the newly created mirrors..
    if(IsMirror(newParentItem))
    {
        const numItemsIndented = selection.length;
        const newParentKids = newParentItem.getChildren();
        const numItemsOnNewParent = newParentKids.length;
        selection = [];
        for (i = numItemsOnNewParent - numItemsIndented; i < numItemsOnNewParent; i++) 
            selection.push(newParentKids[i]);
        
        // ...maybe not needed!?
        VisualSelectionBuffer = selection;
        SelectionPreMove = selection;
    }

    WF.editItemName(selection[0]);
    setCursorAt(currentOffset);

    if(!WF.focusedItem())
        requestAnimationFrame(fixFocus);

    e.preventDefault();
    e.stopPropagation();
}

function indentFocusedItem(e)
{
    e.preventDefault();
    e.stopPropagation();

    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const focusPrevSibling = focusedItem.getPreviousVisibleSibling();
    if(!focusPrevSibling)
        return;

    var prio = 0;
        const kids = focusPrevSibling.getChildren(); 
        if(kids.length !== 0)
            prio = kids[kids.length-1].getPriority()+1;

    const currentOffset = state.get().anchorOffset

    // focus on new parent in case re-focusing fails after move.
    WF.editItemName(focusPrevSibling);

    WF.editGroup(() => 
    {
        WF.moveItems([focusedItem], focusPrevSibling, prio);
    });
    
    // we need to focus on the newly created mirror
    if (IsMirror(focusPrevSibling))
    {
        const kids = focusPrevSibling.getChildren();
        if(kids.length > 0)
        {
            focusedItem = kids[kids.length-1];
        }
    }

    WF.editItemName(focusedItem);

    setCursorAt(currentOffset);

    if(!WF.focusedItem())
        requestAnimationFrame(fixFocus);
}

function outdentFocusedItem(e)
{
    e.preventDefault();
    e.stopPropagation();

    var focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    const focusParent = focusedItem.getParent();
    if(!focusParent)
        return;

    const currentItem = WF.currentItem();
    if(currentItem.equals(focusParent))
        return;

    var newPriority = focusParent.getPriority() + 1;
    const newParent = focusParent.getParent();

    const currentOffset = state.get().anchorOffset

    // focus on new parent in case re-focusing fails after move.
    WF.editItemName(newParent);

    WF.editGroup(() => 
    {
        WF.moveItems([focusedItem], newParent, newPriority);
    });
    
    // we need to replace the mirrored item with the original, 
    // if we try to move it out of the parent, which also is a mirror.
    if(IsMirror(focusedItem))
        focusedItem = GetMirroredItem(focusedItem);

    // WF.editItemName(focusedItem);
    WF.editItemName(focusParent.getNextVisibleSibling());

    setCursorAt(currentOffset);

    if(!WF.focusedItem())
        requestAnimationFrame(fixFocus);
}

function outdentSelection(e, bIncludingChildren = false)
{
    var selection = VisualSelectionBuffer.length !== 0
        ? VisualSelectionBuffer
        : WF.getSelection();

    if (selection === undefined || selection.length === 0)
        selection = SelectionPreMove;

    if (selection === undefined || selection.length === 0)
        return;

    const selectionParent = selection[0].getParent();
    if(!selectionParent)
        return;

    var prio = 0;
    var newParentItem = null;

    const currentItem = WF.currentItem();
    if(!currentItem.equals(selectionParent))
    {
        const grandParent = selectionParent.getParent();
        if(grandParent)
        {
            newParentItem = grandParent;
            prio = selectionParent.getPriority() + 1; 
        }
    }
    else if(bIncludingChildren)
    {
        WF.editGroup(() => 
        {
            for (var i = 0, len = selection.length; i < len; i++)
            {
                const kids = selection[i].getVisibleChildren();
                if (kids !== undefined && kids.length !== 0) 
                {
                    const destinationParent = selection[i].getParent();
                    const destinationPriority = selection[i].getPriority() + 1;
                    WF.moveItems(kids, destinationParent, destinationPriority);

                    // the kids have to be added to the selection
                    // now that they have been outdented
                    selection = selection.concat(kids);
                    VisualSelectionBuffer = selection;
                    WF.setSelection(selection);
                }
            }
        });
    }

    SelectionPreMove = selection;

    if(newParentItem === null || newParentItem === undefined)
        return;

    const currentOffset = state.get().anchorOffset
    WF.editItemName(newParentItem);

    WF.editGroup(() => 
    {
        WF.moveItems(selection, newParentItem, prio);
        VisualSelectionBuffer = selection;
        WF.setSelection(selection);

        // @TODO: this will only work if the expansion is instant
        // if(newParentItem.getChildren().length !== 0 && !newParentItem.isExpanded())
        //   WF.expandItem(newParentItem);
    });

    // we need to replace the mirrored items with 
    // the originals if we try to move mirrored
    // items outside of the topmost mirror
    if(IsMirror(selection[0]))
    {
        const theMirrorsParent = selection[0].getParent();
        if(theMirrorsParent && IsMirror(theMirrorsParent))
        {
            ReplaceMirroredItems(selection);
            WF.setSelection(selection);
            VisualSelectionBuffer = selection;
        }
    }

    WF.editItemName(selectionParent.getNextVisibleSibling());
    // WF.editItemName(selection[0]);

    setCursorAt(currentOffset);

    if(!WF.focusedItem())
        requestAnimationFrame(fixFocus);

    // we've placed these down here due to "TAB"
    // if this fails then workflowys TAB will take over.
    e.preventDefault();
    e.stopPropagation();
}

function deleteSelectedItems(t)
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    var CurrentSelection = WF.getSelection();
    if (CurrentSelection !== undefined && CurrentSelection.length !== 0) 
    {
        minNumAncestors = GetMinNumAncestors(CurrentSelection);
        var filteredSelection = CurrentSelection.filter(function(item, index, arr)
        {
            return item.getAncestors().length <= minNumAncestors; 
        });

        var topMostItem = null;
        var minIndex = Number.MAX_SAFE_INTEGER;
        for (var i = 0, len = filteredSelection.length; i < len; i++) 
        {
            const prio = filteredSelection[i].getPriority();  
            if(prio < minIndex)
            {
                topMostItem = filteredSelection[i];
                minIndex = prio;
            }
        }

        if(topMostItem && topMostItem.getPriority() !==0 && topMostItem.getPreviousVisibleSibling())
            WF.editItemName(topMostItem.getPreviousVisibleSibling());
        else if(topMostItem && topMostItem.getParent())
            WF.editItemName(topMostItem.getParent());
        else
            WF.editItemName(WF.currentItem());

        WF.editGroup(() => 
        {
            for (var i = 0, len = CurrentSelection.length; i < len; i++)
            {
                 WF.deleteItem(CurrentSelection[i]); 
            }
        });

    }
    else
    {
        // we always want to go down, as long as there is an item. Otherwise up.
        const nextItem = focusedItem.getNextVisibleSibling();
        const prevItem = focusedItem.getPreviousVisibleSibling();
        const parentItem = focusedItem.getParent();

        WF.deleteItem(focusedItem);

        if(nextItem)
        {
            WF.editItemName(nextItem);
            // console.log("nextItem: " + nextItem.getNameInPlainText());
        }
        else if(prevItem)
        {
            WF.editItemName(prevItem);
            // console.log("prevItem: " + prevItem.getNameInPlainText());
        }
        else if(parentItem)
        {
            WF.editItemName(parentItem);
            // console.log("parentItem: " + parentItem.getNameInPlainText());
        }
        else
        {
            WF.editItemName(WF.currentItem());
        }

        setCursorAt(state.get().anchorOffset);
    }

    // hide the delete message (as long as we aren't peforming a search)
    if(WF.currentSearchQuery() === null)
        WF.hideMessage();

}

function visualMode_AddItemToSelection_Above(t)
{
    const focusedItem = WF.focusedItem();

    if(!focusedItem)
        return;

    const currentItem = WF.currentItem();

    if(focusedItem.equals(currentItem))
        return;

    if(focusedItem.getPriority() === 0 && focusedItem.getParent().equals(currentItem))
        return;

    // fix for invisible siblings that are placed at the top
    if(currentItem.getVisibleChildren()[0].equals(focusedItem))
        return;

    const previousVisibleSibling = focusedItem.getPreviousVisibleSibling();
    if(previousVisibleSibling && previousVisibleSibling.equals(currentItem))
        return;

    var currentSelection = VisualSelectionBuffer.length !== 0 ? VisualSelectionBuffer : WF.getSelection();
    const itemAtStart = focusedItem;

    if(itemAtStart && !containsItem(currentSelection, itemAtStart))
        currentSelection.unshift(itemAtStart);

    // console.clear();
    // console.log("focusedItem before move: " + WF.focusedItem().getNameInPlainText());

    setCursorAfterVerticalMove(offsetCalculator(state), moveCursorUp(t));

    // console.log("focusedItem after move: " + WF.focusedItem().getNameInPlainText());
    // console.log("child of focusedItem after move: " + getChildOfCurrentItem(WF.focusedItem()).getNameInPlainText());

    const initialSelectionItemAncestors = InitialSelectionItem.getAncestors();

    // if (YoungerThenInitial || SameAgeButDifferentBranch || bDifferentTree)
    if(  (WF.focusedItem().getAncestors().length > InitialSelectionItem.getAncestors().length)
        || (WF.focusedItem().getAncestors().length === InitialSelectionItem.getAncestors().length) && (!WF.focusedItem().getParent().equals(InitialSelectionItem.getParent()))
        || (!WF.focusedItem().getParent().equals(WF.currentItem())) && (!getChildOfCurrentItem(WF.focusedItem()).equals(getChildOfCurrentItem(InitialSelectionItem))))
    {
        const prevSibling = focusedItem.getPreviousVisibleSibling(); 
        const bSharesTheSameTreeAsNewFocus = containsItem(WF.focusedItem().getAncestors(), InitialSelectionItem);
        if(!prevSibling || (prevSibling.getAncestors().length < initialSelectionItemAncestors.length && bSharesTheSameTreeAsNewFocus))
        {
            WF.editItemName(InitialSelectionItem);
        }
        // else if(initialSelectionItemAncestors.length < WF.focusedItem().getAncestors().length)
        // {
        //   const prevSiblingKids = prevSibling.getVisibleChildren(); 
        //   WF.editItemName(prevSiblingKids[prevSiblingKids.length-1]);
        // }
        // else if(initialSelectionItemAncestors.length == WF.focusedItem().getAncestors().length)
        // {
        //   WF.editItemName(WF.focusedItem().getAncestors()[initialSelectionItemAncestors.length-1]);
        // }
        else
        {
            WF.editItemName(prevSibling);
        }
    }

    const itemAfterMove = WF.focusedItem();
    if(itemAfterMove && !itemAfterMove.equals(currentItem))
    {
        if(!containsItem(currentSelection, itemAfterMove))
            currentSelection.unshift(itemAfterMove);

        var minNumAncestors = GetMinNumAncestors(currentSelection);
        var initialSelectionItemIndex = InitialSelectionItem.getPriority();

        const itemAfterMoveAncestors = itemAfterMove.getAncestors()
        var indexOfItemAfterMove = itemAfterMove.getPriority();

        /////////////////////////////////////////////////////////////
        // prio check down the tree branches 
        var itemSelectionIndexCommonToItemAfterMove = initialSelectionItemIndex;
        if(initialSelectionItemAncestors.length > itemAfterMoveAncestors.length)
            var itemSelectionIndexCommonToItemAfterMove = initialSelectionItemAncestors[itemAfterMoveAncestors.length].getPriority();

        var filteredSelection = currentSelection.filter(function(item, index, arr)
        {
            const itemIndex = item.getPriority();
            const itemAncestors = item.getAncestors()
            if(itemAncestors.length === itemAfterMoveAncestors.length)
            {
                return itemIndex <= Math.max(itemSelectionIndexCommonToItemAfterMove, indexOfItemAfterMove); 
            }
            return true;
        });

        /////////////////////////////////////////////////////////////
        // remove parents that have non-selected kids 
        filteredSelection = filteredSelection.filter(function(item, index, arr)
        {
            const itemIndex = item.getPriority();
            const itemAncestors = item.getAncestors()
            if(itemAncestors.length === itemAfterMoveAncestors.length)
            {
                return itemIndex <= Math.max(itemSelectionIndexCommonToItemAfterMove, indexOfItemAfterMove); 
            }
            else if(itemAncestors.length > itemAfterMoveAncestors.length)
            {
                return true;
            }
            // else
            else if(itemAfterMove.equals(item))
            {
                var childrenRemaining = item.getVisibleChildren().length;
                if(childrenRemaining <= 1)
                    return false;

                for (var i = 0, len = filteredSelection.length; i < len; i++) 
                {
                    if(filteredSelection[i].getParent().equals(item))
                    {
                        --childrenRemaining;
                    }
                }

                if(childrenRemaining === 0)
                    return true;
                else
                    return false;
            }
            return false;
        });

        /////////////////////////////////////////////////////////////
        // do prio check with common ancestors 
        if(initialSelectionItemAncestors.length > minNumAncestors)
                initialSelectionItemIndex = initialSelectionItemAncestors[minNumAncestors].getPriority();

        if(itemAfterMoveAncestors.length > minNumAncestors)
                indexOfItemAfterMove = itemAfterMoveAncestors[minNumAncestors].getPriority();

        filteredSelection = filteredSelection.filter(function(item, index, arr)
        {
            var indexToCompare = item.getPriority();
            const itemAncestors = item.getAncestors()
            if(itemAncestors.length > minNumAncestors)
                indexToCompare = itemAncestors[minNumAncestors].getPriority();

            return indexToCompare <= Math.max(initialSelectionItemIndex, indexOfItemAfterMove); 
        });

        /////////////////////////////////////////////////////////////
        // add parents for orphaned children
        minNumAncestors = GetMinNumAncestors(filteredSelection);
        for (var i = 0, len = filteredSelection.length; i < len; i++) 
        {
            const ancestors = filteredSelection[i].getAncestors();
            if(ancestors.length > minNumAncestors)
            {
                const desiredAncestor = ancestors[minNumAncestors]; 
                if(!containsItem(filteredSelection, desiredAncestor))
                {
                    filteredSelection.unshift(desiredAncestor);
                }
            }
        }

        currentSelection = filteredSelection;
    }

    VisualSelectionBuffer = currentSelection;
    WF.setSelection(currentSelection);
}

function visualMode_AddItemToSelection_Below(t)
{
    const focusedItem = WF.focusedItem();

    if(!focusedItem)
        return;

    if(focusedItem.getParent().equals(WF.currentItem()) && !focusedItem.getNextVisibleSibling())
    {
        const focusKids = focusedItem.getVisibleChildren();
        if(focusKids.length === 0 || (!focusedItem.equals(InitialSelectionItem) && !containsItem(InitialSelectionItem.getAncestors(), focusedItem)))
        {
            return;
        }
    }

    const itemAtStart = focusedItem; 

    var currentSelection = VisualSelectionBuffer.length !== 0 ? VisualSelectionBuffer : WF.getSelection();

    if(itemAtStart && !containsItem(currentSelection, itemAtStart))
        currentSelection.push(itemAtStart);

    setCursorAfterVerticalMove(offsetCalculator(state), moveCursorDown(t));

    // if (YoungerThenInitial || SameAgeButDifferentBranch || bDifferentTree)
    if(  (WF.focusedItem().getAncestors().length > InitialSelectionItem.getAncestors().length)
        || (WF.focusedItem().getAncestors().length === InitialSelectionItem.getAncestors().length) && (!WF.focusedItem().getParent().equals(InitialSelectionItem.getParent()))
        || (!WF.focusedItem().getParent().equals(WF.currentItem())) && (!getChildOfCurrentItem(WF.focusedItem()).equals(getChildOfCurrentItem(InitialSelectionItem))))
    {
        const nextSibling = focusedItem.getNextVisibleSibling(); 
        if(nextSibling)
        {
            WF.editItemName(nextSibling);
        }
        else
        {
            const ancestors = focusedItem.getAncestors();
            var i = ancestors.length; 
            while(i--)
            {
                if(ancestors[i].getNextVisibleSibling())
                {
                    WF.editItemName(ancestors[i].getNextVisibleSibling());
                    break;
                }
            }

            // we've reached end of the visible list
            if(i <= 0)
            {
                // console.log("reached end of list");
                return;
            }
        }
    }

    const itemAfterMove = WF.focusedItem();
    if(itemAfterMove)
    {
        if(!containsItem(currentSelection, itemAfterMove))
        {
            currentSelection.push(itemAfterMove);
        }

        // console.log("moved to: " + itemAfterMove.getNameInPlainText());
        // console.log("currentSelection after moving: ");
        // currentSelection.forEach((item, i) => 
        // {
        //   // console.log("index: " + i);
        //   console.log("item: " + item.getNameInPlainText());
        // });

        var minNumAncestors = GetMinNumAncestors(currentSelection);
        var initialSelectionItemIndex = InitialSelectionItem.getPriority();
        const initialSelectionItemAncestors = InitialSelectionItem.getAncestors()
        const itemAfterMoveAncestors = itemAfterMove.getAncestors()
        var indexOfItemAfterMove = itemAfterMove.getPriority();

        /////////////////////////////////////////////////////////////
        // prio check down the tree branches and
        var itemSelectionIndexCommonToItemAfterMove = initialSelectionItemIndex;
        if(initialSelectionItemAncestors.length > itemAfterMoveAncestors.length)
            var itemSelectionIndexCommonToItemAfterMove = initialSelectionItemAncestors[itemAfterMoveAncestors.length].getPriority();

        var filteredSelection = currentSelection.filter(function(item, index, arr)
        {
            const itemIndex = item.getPriority();
            const itemAncestors = item.getAncestors()
            if(itemAncestors.length === itemAfterMoveAncestors.length && item.getParent().equals(itemAfterMove.getParent()))
            {
                return itemIndex >= Math.min(itemSelectionIndexCommonToItemAfterMove, indexOfItemAfterMove); 
            }
            return true;
        });

        // console.log("currentSelection after 1st prio filter");
        // filteredSelection.forEach((item, i) => 
        // {
        //   console.log("item: " + item.getNameInPlainText());
        // });

        /////////////////////////////////////////////////////////////
        // remove parents that have kids which aren't selected
        filteredSelection = filteredSelection.filter(function(item, index, arr)
        {
            const itemIndex = item.getPriority();
            const itemAncestors = item.getAncestors()
            if(itemAncestors.length === itemAfterMoveAncestors.length)
            {
                return itemIndex >= Math.min(itemSelectionIndexCommonToItemAfterMove, indexOfItemAfterMove); 
            }
            else if(itemAncestors.length > itemAfterMoveAncestors.length)
            {
                return true;
            }
            else if(itemAfterMove.equals(item))
            // else 
            {
                // console.log("checking kids");
                var childrenRemaining = item.getVisibleChildren().length;
                if(childrenRemaining <= 1)
                {
                    // console.log("no multi kids, removing: " + item.getNameInPlainText())
                    return false;
                }

                for (var i = 0, len = filteredSelection.length; i < len; i++) 
                {
                    if(filteredSelection[i].getParent().equals(item))
                    {
                        --childrenRemaining;
                    }
                }

                if(childrenRemaining === 0)
                {
                    // console.log("all kids included");
                    return true;
                }
                else
                {
                    // console.log("all kids were not included, removing:  " + item.getNameInPlainText());
                    return false;
                }
            }

            return false;
        });

        // console.log("currentSelection after 2nd prio filter");
        // filteredSelection.forEach((item, i) => 
        // {
        //   console.log("item: " + item.getNameInPlainText());
        // });

        /////////////////////////////////////////////////////////////
        // do prio check with common ancestors 
        if(initialSelectionItemAncestors.length > minNumAncestors)
                initialSelectionItemIndex = initialSelectionItemAncestors[minNumAncestors].getPriority();

        if(itemAfterMoveAncestors.length > minNumAncestors)
                indexOfItemAfterMove = itemAfterMoveAncestors[minNumAncestors].getPriority();

        filteredSelection = filteredSelection.filter(function(item, index, arr)
        {
            var indexToCompare = item.getPriority();
            const itemAncestors = item.getAncestors()
            if(itemAncestors.length > minNumAncestors)
                indexToCompare = itemAncestors[minNumAncestors].getPriority();

            return indexToCompare >= Math.min(initialSelectionItemIndex, indexOfItemAfterMove); 
        });

        // console.log("currentSelection after ancestor filter");
        // filteredSelection.forEach((item, i) => 
        // {
        //   console.log("item: " + item.getNameInPlainText());
        // });

        /////////////////////////////////////////////////////////////
        // add parents for orphaned children
        minNumAncestors = GetMinNumAncestors(filteredSelection);

        for (var i = 0, len = filteredSelection.length; i < len; i++) 
        {
            const ancestors = filteredSelection[i].getAncestors();
            if(ancestors.length > minNumAncestors)
            {
                const desiredAncestor = ancestors[minNumAncestors]; 
                if(!containsItem(filteredSelection, desiredAncestor))
                {
                    filteredSelection.unshift(desiredAncestor);
                    // WF.editItemName(desiredAncestor);
                }
            }
        }

        currentSelection = filteredSelection;
    }

    // console.log("currentSelection setSelection");
    // currentSelection.forEach((item, i) => 
    // {
    //   console.log("item: " + item.getNameInPlainText());
    // });

    VisualSelectionBuffer = currentSelection;
    WF.setSelection(currentSelection);
}

function ContainsInvalidItem(items)
{
    var i = items.length;
    while(i--)
    {
        if(!items[i])
        {
            return true;
        }
    }
    return false;
}

function ContainsCompletedItem(items)
{
    var i = items.length;
    while(i--)
    {
        if(items[i].isCompleted())
            return true;

        if(ContainsCompletedItem(items[i].getChildren()))
            return true;
    }
    return false;
}

function containsItem(arr, item)
{
    for (var i = 0, len = arr.length; i < len; i++) 
    {
        if(arr[i].equals(item))
            return true;
    }
    return false;
}

function GetMinNumAncestors(arr)
{
    var minNumAncestors = Number.MAX_SAFE_INTEGER;
    for (var i = 0, len = arr.length; i < len; i++) 
    {
        const numAncestors = arr[i].getAncestors().length;
        if(numAncestors < minNumAncestors)
            minNumAncestors = numAncestors;
    }
    return minNumAncestors;
}

function fixFocus() 
{
    fixFocus_2();
/*     const active = document.activeElement.className;

    if (active.includes("searchBoxInput")) 
        return;

    if (active.includes("content")) 
        return;

    const matches = document.querySelectorAll(".name.matches .content, .notes.matches .content");
    matches.length > 0 ? matches[0].focus() : document.getElementsByClassName("content")[0].focus(); */
}

function fixFocus_2()
{
  const active = document.activeElement;
  const cls = typeof active?.className === "string"
      ? active.className
      : (active?.className && active.className.baseVal) || ""; // SVGAnimatedString fallback

  // early-out because focus is where we want it to be.
  if (cls.includes("searchBoxInput") || cls.includes("content")) 
    return;

  // Prefer current search hit/contenteditable areas, then any .content
  const candidate =
    document.querySelector(".name.matches .content") ||
    document.querySelector(".notes.matches .content") ||
    document.querySelector('[contenteditable="true"]') ||
    document.querySelector(".content");

  if (candidate && typeof candidate.focus === "function") 
  {
    // Prevent scroll jumps if WF is mid-layout
    candidate.focus({ preventScroll: true });
  } 
  else 
  {
    // Nothing to focus yet: try again shortly (DOM may still be mounting)
    setTimeout(fixFocus, 50);
  }
}

// Helper function to focus an item and scroll it into view
function focusItemAndScroll(item) {
    if (!item) return;

    WF.editItemName(item);

    // Scroll the item into view if needed
    const element = item.getElement();
    if (element) {
        const rect = element.getBoundingClientRect();
        const floatingHeaderHeight = 50; // Account for Workflowy's header
        const viewportHeight = window.innerHeight;

        // Check if element is outside viewport
        const aboveViewport = rect.top < floatingHeaderHeight;
        const belowViewport = rect.bottom > viewportHeight;

        if (aboveViewport || belowViewport) {
            element.scrollIntoView({
                behavior: 'auto',
                block: 'center'
            });
        }
    }
}

// Focus on the top-most visible bullet in the viewport
function focusTopVisibleItem() {
    const floatingHeaderHeight = 50; // Account for Workflowy's header
    const viewportHeight = window.innerHeight;

    // Get all visible project elements
    const projects = document.querySelectorAll('.project');
    let topMostItem = null;
    let topMostTop = Infinity;

    for (const project of projects) {
        const rect = project.getBoundingClientRect();
        // Check if the item is within the visible viewport
        if (rect.top >= floatingHeaderHeight && rect.top < viewportHeight) {
            if (rect.top < topMostTop) {
                topMostTop = rect.top;
                const projectId = project.getAttribute('projectid');
                if (projectId) {
                    topMostItem = WF.getItemById(projectId);
                }
            }
        }
    }

    if (topMostItem) {
        WF.editItemName(topMostItem);
    }
}

// Focus on the bottom-most visible bullet in the viewport
function focusBottomVisibleItem() {
    const floatingHeaderHeight = 50; // Account for Workflowy's header
    const viewportHeight = window.innerHeight;

    // Get all visible project elements
    const projects = document.querySelectorAll('.project');
    let bottomMostItem = null;
    let bottomMostBottom = -Infinity;

    for (const project of projects) {
        const rect = project.getBoundingClientRect();
        // Check if the item is within the visible viewport
        if (rect.bottom > floatingHeaderHeight && rect.bottom <= viewportHeight) {
            if (rect.bottom > bottomMostBottom) {
                bottomMostBottom = rect.bottom;
                const projectId = project.getAttribute('projectid');
                if (projectId) {
                    bottomMostItem = WF.getItemById(projectId);
                }
            }
        }
    }

    if (bottomMostItem) {
        WF.editItemName(bottomMostItem);
    }
}

function preventKeystrokesWhileNavigating(event)
{
    // console.log("trying to prevent: " + event.key);
    if (state.get().mode !== Mode.INSERT)
    {
        if(modifierKeyCodesToIgnore.includes(event.key))
        {
            event.preventDefault();
            event.stopPropagation();
            // console.log("blocking modifier keys");
        }

        const input = validInputKeys.includes(event.key);
        const modified = (event.metaKey || event.altKey || event.ctrlKey)

        // const NonAscii = !(/^[ -~]+$/.test(event.key))
        // if(NonAscii)
        // {
        //     console.log("NON ASCII KEY pressed");
        //     event.preventDefault();
        // }

        // console.log("has been modified: "  + modified);
        // console.log("keydown: " + event.key);
        // console.log("hardware key: " + event.code[event.code.length-1]);

        if (input && !modified)
        {
            event.preventDefault();
            // !!! bind the key if you need to stopPropagation() as well. 
        }
    }
}

function mouseClickIntoInsertMode(event)
{
    if(state.get().mode !== Mode.INSERT)
    {
        goToInsertMode(true);
        requestAnimationFrame(fixFocus);

        if(!WF.focusedItem())
        {
            // we clicked somewhere outside of the tree revert to normal mode!
            WF.zoomTo(WF.currentItem());
            WF.editItemName(WF.currentItem());
            goToNormalMode();
            // console.log("going to normal mode due to lack of focus: ");
        }

        goToInsertMode(false);
        requestAnimationFrame(fixFocus);
    }
}

function reselectItemsBeingMoved()
{
    // Bulk moving items deselects them...
    // Reselecting them during the same event "frame"
    // does not work - which is why we do it on the keyup event for now.
    if (SelectionPreMove !== undefined && SelectionPreMove.length !== 0) 
    {
        WF.setSelection(SelectionPreMove);
        SelectionPreMove = [];
        // console.log("reselectingItemBeingMoved");
    }
}

function updateKeyBuffer_Keydown(event) 
{
    if(modifierKeyCodesToIgnore.includes(event.key))
        return true;

    const key = event.key;

    if(keyBuffer.includes(key_Slash))
    {

        if(key === 'Backspace')
        {
            if(keyBuffer.length > 1)
            {
                keyBuffer.pop();
            }
        }
        else if(!keyBuffer.includes('Enter'))
        // else
        {
            keyBuffer = [...keyBuffer, key];

            const filteredKeys = keyBuffer.filter(function(value, index, arr)
            {
                return validSearchKeys.includes(value);
            });

            var slashIndex = filteredKeys.indexOf("/");
            if (slashIndex > -1) {
                    filteredKeys.splice(slashIndex, 1);
            }

            const keyBufferStr = filteredKeys.join(""); 

            WF.hideMessage();
            WF.showMessage(keyBufferStr.bold(), false);
        }
    }
    else if(key === key_Slash)
    {
        if(state.get().mode === Mode.NORMAL)
        {
            // focus on top item otherwise search fails
            WF.editItemName(WF.currentItem());
            keyBuffer = [key];
        }
    }
    else
    {
        if(keyBuffer.length > 2)
            keyBuffer.shift();

        keyBuffer = [...keyBuffer, key];
    }

    if(keyBuffer.includes(key_Slash) && key !== key_Esc)
    {
        return true;
    }

    return false;
}

function updateKeyBuffer_Keyup(event)
{
    const searchQuery = WF.currentSearchQuery();
    const key = event.key;

    if(keyBuffer.includes(key_Slash))
    {
        if(key === key_Esc)
        {
            keyBuffer = [];
            // console.log("clearing buffer and search");
            WF.hideMessage();
            WF.search("");
            WF.clearSearch();
            WF.editItemName(WF.currentItem());
        }
        else if(key === 'Enter' || keyBuffer.includes('Enter'))
        // else if(searchQuery !== null && key === 'Enter' || keyBuffer.includes('Enter') )
        // else if(key === 'Enter')
        {
            // console.log(searchQuery);

            // temp fix. undo the the ENTER that bleeds through
            WF.undo();

            if(searchQuery !== null)
            {
                WF.editItemName(WF.currentItem());
                keyBuffer = [];
                WF.hideMessage();
            }
            else
            {
                keyBuffer = [...keyBuffer, key];

                // only show this message if you start hammering
                // button while the search is doing its thing
                if(key !== 'Enter')
                {
                    WF.hideMessage();
                    WF.showMessage("Waiting for search Query to complete...".bold(), true);
                }
                else
                {
                    const filteredKeys = keyBuffer.filter(function(value, index, arr)
                    {
                        return validSearchKeys.includes(value);
                    });

                    var slashIndex = filteredKeys.indexOf("/");
                    if (slashIndex > -1) {
                            filteredKeys.splice(slashIndex, 1);
                    }

                    const keyBufferStr = filteredKeys.join(""); 

                    // cancel search upon searching for nothing and pressing enter
                    if(!keyBufferStr)
                    {
                        WF.search("");
                        WF.clearSearch();
                        keyBuffer = [];
                        WF.hideMessage();
                        WF.editItemName(WF.currentItem());
                    }
                    else
                    {
                        // hide the message to tell the user that 
                        // the search has begun
                        WF.hideMessage();
                    }
                }
            }

        }
        else
        {
            const filteredKeys = keyBuffer.filter(function(value, index, arr)
            {
                return validSearchKeys.includes(value);
            });

            var slashIndex = filteredKeys.indexOf("/");
            if (slashIndex > -1) {
                    filteredKeys.splice(slashIndex, 1);
            }

            const keyBufferStr = filteredKeys.join(""); 

            WF.hideMessage();
            WF.showMessage(keyBufferStr.bold(), false);
            WF.search(keyBufferStr);

        }
    }
    else if(searchQuery !== null && key === 'Escape')
    {
            WF.search("");
            WF.clearSearch();
            WF.editItemName(WF.currentItem());
    }
}

function sortCompletedItemsOnFocusParent(t)
{
    const focusedItem = WF.focusedItem();

    if(!focusedItem)
        return;

    var parentItem = focusedItem.getParent();

    if(!parentItem)
        return;

    const currentItem = WF.currentItem();

    if(focusedItem.equals(currentItem))
        parentItem = currentItem;

    const visibleChildren = parentItem.getVisibleChildren();
    if (visibleChildren === undefined || visibleChildren.length === 0) 
        return;

    var completedKids = [];
    for (var i = 0; i < visibleChildren.length; i++) 
    {
        if(visibleChildren[i].isCompleted())
            completedKids.push(visibleChildren[i]);
    }

    if(completedKids.length === 0)
        return;

    completedKids.sort((a, b) => b.getCompletedDate() - a.getCompletedDate());
    WF.editGroup(() => 
    {
        for (var i = 0, len = completedKids.length; i < len; i++)
        {
            if (completedKids[i].getPriority() !== i) 
                WF.moveItems([completedKids[i]], parentItem, i)
        }

        WF.moveItems(completedKids, parentItem, visibleChildren.length);
    });

    if(!containsItem(completedKids, focusedItem))
        WF.editItemName(focusedItem);
    else if(completedKids[0].getPreviousVisibleSibling())
        WF.editItemName(completedKids[0].getPreviousVisibleSibling());
    else
        WF.editItemName(parentItem);

    setCursorAt(state.get().anchorOffset);
}

function zoomOutFocused()
{
    const focusedItem = WF.focusedItem();

    if(focusedItem === null)
        return;

    const currentItem = WF.currentItem();
    const currentItemParent = currentItem.getParent();

    if(currentItemParent)
    {
        // Zoom out instantly by targeting current item parent
        WF.zoomTo(currentItemParent);

        // refocus on currentItem because ZoomTo stole it. 
        WF.editItemName(currentItem);
    }
    else
    {
        // worse case; fallback to animated zoomOut 
        WF.zoomOut(currentItem);
    }

    // refocus on the item we focused in the beginning.
    WF.editItemName(focusedItem);

    // we might lose focus during the above operations due to various reasons. 
    if(!WF.focusedItem())
    {
        requestAnimationFrame(fixFocus);
        goToNormalMode();
    }

    setCursorAt(state.get().anchorOffset);
}

function zoomInFocused()
{
    const focusedItem = WF.focusedItem();
    if(focusedItem === null)
        return;

    const focusedAncestors = focusedItem.getAncestors();
    if(focusedAncestors.length === 0)
        return;

    if(focusedAncestors.length === 1)
    {
        WF.zoomTo(focusedItem);
        setCursorAt(state.get().anchorOffset);
    }
    else
    {
        const currentItem = WF.currentItem();

        for (var i = 0, len = focusedAncestors.length; i < len; i++)
        {
            const itemParent = focusedAncestors[i].getParent();
            if(itemParent && itemParent.equals(currentItem))
            {
                WF.zoomTo(focusedAncestors[i]);
                WF.editItemName(focusedItem);
                setCursorAt(state.get().anchorOffset);
                return;
            }
        }
    }
}

function zoomOutInstantly()
{
    const currentItem = WF.currentItem();
    const currentItemParent = currentItem.getParent();
    if(currentItemParent)
    {
        WF.zoomTo(currentItemParent);
        WF.editItemName(currentItem);
        setCursorAt(state.get().anchorOffset);
    }
    else
    {
        WF.zoomOut(WF.currentItem());
    }

}

function zoomInInstantly()
{
        const focusedItem = WF.focusedItem();
        if(focusedItem)
        {
            WF.zoomTo(focusedItem);

            const kids = focusedItem.getVisibleChildren();
            if(kids !== undefined && kids.length !== 0)
                WF.editItemName(kids[0]);
            else
                WF.editItemName(focusedItem);

            setCursorAt(state.get().anchorOffset);
        }
}

function deleteNote(item)
{
        if(!item)
            return;

        WF.editGroup(() => 
        {
            WF.setItemNote(item, "");
            WF.editItemName(item);
            setCursorAt(state.get().anchorOffset);
        });

}

function addSiblingsFromInitList(bSiblingsAboveInitItem = true)
{
    if(!InitialSelectionItem)
        return;

    var selection = WF.getSelection();
    if (selection === undefined || selection.length === 0) 
        selection = SelectionPreMove;

    if (selection === undefined || selection.length === 0)
        return;

    const initParent = InitialSelectionItem.getParent();
    const initPrio = InitialSelectionItem.getPriority();
    const siblings = initParent.getVisibleChildren();
    if (siblings === undefined || siblings.length === 0) 
        return;

    WF.editGroup(() => 
    {
        var siblingsToBeAdded = [];
        var siblingsToBeRemoved = [];
        if(bSiblingsAboveInitItem)
        {
            for (var i = 0, len = siblings.length; i < len; i++)
            {
                var item = siblings[i];
                if(item.getPriority() < initPrio)
                {
                    siblingsToBeAdded.push(item);
                }
                else if(item.getPriority() !==initPrio)
                {
                    siblingsToBeRemoved.push(item);
                }
            }
        }
        else
        {
            for (var i = 0, len = siblings.length; i < len; i++)
            {
                var item = siblings[i];
                if(item.getPriority() > initPrio)
                {
                    siblingsToBeAdded.push(item);
                }
                else if(item.getPriority() !==initPrio)
                {
                    siblingsToBeRemoved.push(item);
                }
            }
        }

        if(bSiblingsAboveInitItem)
            selection = siblingsToBeAdded.concat(selection);
        else
            selection = selection.concat(siblingsToBeAdded);

        selection = selection.filter(x => 
            !containsItem(siblingsToBeRemoved, x)
        );

        const currentOffset = state.get().anchorOffset
        VisualSelectionBuffer = selection;
        SelectionPreMove = selection;
        WF.setSelection(selection);
        WF.editItemName(selection[bSiblingsAboveInitItem ? 0 : selection.length - 1]);
        setCursorAt(currentOffset);
    });
}

function addSiblingsFromCurrentList(bAbove = true)
{
    if(!InitialSelectionItem)
        return;

    var selection = WF.getSelection();
    if (selection === undefined || selection.length === 0) 
        selection = SelectionPreMove;

    if (selection === undefined || selection.length === 0)
        return;

    const initsCurrentItemAncestor = getChildOfCurrentItem(InitialSelectionItem);
    const initPrio = initsCurrentItemAncestor.getPriority();
    const siblings = WF.currentItem().getVisibleChildren();

    WF.editGroup(() => 
    {
        var siblingsToBeAdded = [];
        var siblingsToBeRemoved = [];
        if(bAbove)
        {
            for (var i = 0, len = siblings.length; i < len; i++)
            {
                var item = siblings[i];
                if(item.getPriority() < initPrio)
                {
                    siblingsToBeAdded.push(item);
                }
                else if(item.getPriority() !==initPrio)
                {
                    siblingsToBeRemoved.push(item);
                }
            }
        }
        else
        {
            for (var i = 0, len = siblings.length; i < len; i++)
            {
                var item = siblings[i];
                if(item.getPriority() > initPrio)
                {
                    siblingsToBeAdded.push(item);
                }
                else if(item.getPriority() !==initPrio)
                {
                    siblingsToBeRemoved.push(item);
                }
            }
        }

        if(bAbove)
        {
            selection = siblingsToBeAdded.concat(selection);
            selection.push(initsCurrentItemAncestor);
        }
        else
        {
            selection = selection.concat(siblingsToBeAdded);
            selection.unshift(initsCurrentItemAncestor);
        }

        selection = selection.filter(x => 
            !containsItem(siblingsToBeRemoved, x)
        );


        const currentOffset = state.get().anchorOffset
        VisualSelectionBuffer = selection;
        SelectionPreMove = selection;
        WF.setSelection(selection);
        WF.editItemName(selection[bAbove ? 0 : selection.length - 1]);
        setCursorAt(currentOffset);
    });

}

function changeNote(item)
{
        if(!item)
            return;

        WF.editGroup(() => 
        {
            WF.editItemName(WF.currentItem());
            WF.setItemNote(item, "");
            WF.editItemNote(item);

            WF.insertText("");

            WF.editItemName(WF.currentItem());
            WF.setItemNote(item, "");
            WF.editItemNote(item);

            WF.editItemName(WF.focusedItem());
            WF.editItemNote(item);
        });

        goToInsertMode();
}

function deleteUnderCursor(t)
{
    const currentOffset = state.get().anchorOffset;

    // delete under cursor
    WF.insertText("");

    let desiredOffset = currentOffset;
    const maxLen = WF.focusedItem().getNameInPlainText().length;
    if(maxLen === currentOffset)
        desiredOffset -= 1;

    moveCursorTo(t, offsetCalculator(state), desiredOffset);


}
function handleAfterMode(e)
{
    // update the temp buffer with the latest data
    keyBufferTempCopy = [...keyBufferTempCopy, e.key];

    goToNormalMode();

    if(keyBufferTempCopy.length > 2)
    {
        const focusedItem = WF.focusedItem();
        if(focusedItem)
        {
            const num = keyBufferTempCopy.length;
            const key = keyBufferTempCopy[num-1] ;
            const modType = keyBufferTempCopy[num-3] ;
            if(modType === 'd' && key === 'w')
            {
                deleteInnerWord(e, true);
            }
        }
    }

    keyBufferTempCopy = [];
}

function handleInnerMode(e)
{
    // update the temp buffer with the latest data
    keyBufferTempCopy = [...keyBufferTempCopy, e.key];

    goToNormalMode();

    if(keyBufferTempCopy.length > 2)
    {
        const focusedItem = WF.focusedItem();
        if(focusedItem)
        {
            const num = keyBufferTempCopy.length;
            const key = keyBufferTempCopy[num-1] ;
            const modType = keyBufferTempCopy[num-3] ;
            // console.log("mod type: " + modType);
            if(modType === 'c')
            {
                if(key === 'w')
                {
                    changeInnerWord(e);
                    goToInsertMode();
                }
            }
            else if(modType === 'd')
            {
                if(key === 'w')
                {
                    deleteInnerWord(e, false);
                }
            }
        }
    }

    keyBufferTempCopy = [];
}

function changeInnerWord(e)
{
    WF.editGroup(() => 
    {
        if (keyBufferTempCopy.length > 3 && !isNaN(keyBufferTempCopy[keyBufferTempCopy.length-4]))
        {
            const iterNum = parseInt(keyBufferTempCopy[keyBufferTempCopy.length-4]);
            for (let i = 1; i <= iterNum; ++i) 
            {
                if(i === 1)
                    deleteWord(e, false);
                else
                    deleteUntilWordEnd(false);
            }
        }
        else
        {
            deleteWord(e, false)
        }
    });
}

function deleteInnerWord(e, bAfterWord = false)
{
    WF.editGroup(() => 
    {
        if (keyBufferTempCopy.length > 3 && !isNaN(keyBufferTempCopy[keyBufferTempCopy.length-4]))
        {
            const iterNum = parseInt(keyBufferTempCopy[keyBufferTempCopy.length-4]);
            for (let i = 1; i <= iterNum; ++i) 
            {
                if(i === 1)
                    deleteWord(e, bAfterWord);
                else
                    deleteUntilWordEnd(bAfterWord);

            }
        }
        else
        {
            deleteWord(e, bAfterWord);
        }
    });
}

function handleFindMode(e)
{
    goToNormalMode();

    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return;

    if(event.key === key_Esc)
        return;

    const filteredKeys = keyBuffer.filter(function(value, index, arr)
    {
        return validSearchKeys.includes(value);
    });

    if(filteredKeys.length <= 0)
        return;

    keyBuffer = [];

    // check if we pressed 't' / 'f' or 'F' / 'T'
    // lowercase 'f' or 't' means search forwards, uppercase 'F' or 'T' means search backwards
    let bSearchForwards = true;
    if(filteredKeys.length > 1) {
        const triggerKey = filteredKeys[filteredKeys.length-2];
        bSearchForwards = (triggerKey === 'f' || triggerKey === 't');
    } 

    const keyToFind = filteredKeys[filteredKeys.length-1];
    const currentOffset = state.get().anchorOffset;
    const itemNameText = focusedItem.getNameInPlainText();

    let newOffset = bSearchForwards 
    ? itemNameText.indexOf(keyToFind, currentOffset+1) 
    : itemNameText.lastIndexOf(keyToFind, currentOffset-1);

    if(newOffset !== -1)
    {
        if(filteredKeys.length > 2 && !isNaN(filteredKeys[filteredKeys.length-3]))
        {
            const iterNum = parseInt(filteredKeys[filteredKeys.length-3]);
            for (let i = 1; i < iterNum; ++i) 
            {
                let iterNewOffset = bSearchForwards 
                ? itemNameText.indexOf(keyToFind, newOffset+1) 
                : itemNameText.lastIndexOf(keyToFind, newOffset-1);

                if(iterNewOffset !== -1)
                    newOffset = iterNewOffset;
            }
        }

        // offset if its a 't' or 'T'
        let targetOffset = newOffset; 
        if(filteredKeys.length > 1 && filteredKeys[filteredKeys.length-2].toLowerCase() === "t")
            targetOffset -= 1;

        moveCursorTo(
            e.target,
            offsetCalculator(state),
            targetOffset
        );
    }

}

function handleReplaceMode(e)
{
    if(event.key !== key_Esc)
    {
        const filteredKeys = keyBuffer.filter(function(value, index, arr)
        {
            // @TODO: switch to a common 'validKeys' instead
            // which both replace and search uses
            return validSearchKeys.includes(value);
        });

        // @TODO: remove this once we implement 'R'
        keyBuffer = [];

        if(filteredKeys.length > 0)
        {
            const currentOffset = state.get().anchorOffset;
            WF.insertText(filteredKeys[filteredKeys.length-1]);
            moveCursorTo(e.target, offsetCalculator(state), currentOffset);
        }
    }

    goToNormalMode();
}

const onlyIfProjectCanBeEdited = command => target => {
    const targetProject = projectAncestor(target)
    const isMainDotOfForeignSharedList = targetProject.className.includes('addedShared')
    const isNotEditable = targetProject.getAttribute('data-tid') === '2'
    const commandShouldBePrevented = isMainDotOfForeignSharedList || isNotEditable
    if (commandShouldBePrevented) 
    {
            flashMode('Cannot edit this')
            return
    }
    command(target)
}

function SimulateEscapeInsertMode(e)
{
    // it will not work while we are in the JumpToItem menu
    if(!WF.focusedItem())
        return;

    e.preventDefault()
    e.stopPropagation()

    goToNormalMode();
}

// assumes Escape is actually being pressed
function HandleEscapeInsertMode(e)
{
    // prevent it from focusing on the search bar
    e.preventDefault()

    if(!WF.focusedItem())
    {
        // important that we don't stop propagation
        // when trying to escape the JumpToItemMenu
        if(focusPreJumpToItemMenu)
        {
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

        // Update cursor pos because it doesn't get updated during insert mode
        let extraLength = 0;
        const nodes = getNodes(WF.focusedItem().getElement());
        for(let i = 0; i < nodes.length; ++i) 
        {
            if(!window.getSelection().containsNode(nodes[i]))
                extraLength += nodes[i].length;
            else
                // only count length up to the focused node
                break;
        }
        const cursorOffsetReset = document.getSelection().getRangeAt(0).startOffset; 
        setCursorAt(cursorOffsetReset);
        const targetOffset = state.get().anchorOffset + extraLength;
        moveCursorTo(e.target, offsetCalculator(state), targetOffset);
    }

    goToNormalMode();
}

function SimulateEscapeVisualMode(e)
{
    if(WF.focusedItem())
    {
            const selection = WF.getSelection();
            if (selection !== undefined && selection.length !== 0)
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

// assumes Escape is actually being pressed
function HandleEscapeVisualMode(e)
{
    if(WF.focusedItem())
    {
            const selection = WF.getSelection();
            if (selection !== undefined && selection.length !== 0)
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

function SimulateEscapeNormalMode(e)
{
    if(WF.focusedItem())
    {
            const selection = WF.getSelection();
            if (selection !== undefined && selection.length !== 0)
            {
                VisualSelectionBuffer = [];
                WF.setSelection([]);
            }

    }

    e.preventDefault()
    e.stopPropagation()

    WF.hideMessage();
    WF.hideDialog();
    goToNormalMode();
}

// assumes Escape is actually being pressed
function HandleEscapeNormalMode(e)
{
    if(WF.focusedItem())
    {
            const selection = WF.getSelection();
            if (selection !== undefined && selection.length !== 0)
            {
                VisualSelectionBuffer = [];
                WF.setSelection([]);
            }
    }

    e.preventDefault()
    e.stopPropagation()

    WF.hideMessage();
    WF.hideDialog();
    goToNormalMode();
}

function goToListBottom(event, listRootItem)
{
    var focusedItem = WF.focusedItem();

    if(!focusedItem)
        return;

    if(!listRootItem)
        return;

    const visibleChildren = listRootItem.getVisibleChildren();
    if (visibleChildren === undefined || visibleChildren.length === 0) 
        return;

    const currentOffset = state.get().anchorOffset

    // edge case; we would teleport outside of the visible list without this!
    if(focusedItem.equals(WF.currentItem()))
        WF.editItemName(visibleChildren[0]);

    const finalKid = visibleChildren[visibleChildren.length - 1];

    event.preventDefault()
    event.stopPropagation()

    // check if we are at the very bottom.
    if(containsItem(focusedItem.getAncestors(), finalKid))
        return;

    WF.editItemName(finalKid);
    setCursorAt(currentOffset);

    // did we make the jump?
    if(WF.focusedItem().equals(finalKid))
    {
        // do a recursive jump if we were standing on the bottom kid when we started
        if(finalKid.isExpanded() && focusedItem.equals(finalKid))
            goToListBottom(event, finalKid);
        return;
    }

    // The jump failed because there are to many items 
    // in the way. We'll start collapsing all items
    // and start marching down.
    focusedItem = WF.focusedItem();
    if(focusedItem.isExpanded() && WF.currentSearchQuery() === null)
        WF.collapseItem(focusedItem);

    var i = visibleChildren.length; 
    while(i--)
    {
        if(!focusedItem)
            break;

        if(focusedItem.isExpanded() && WF.currentSearchQuery() === null)
            WF.collapseItem(focusedItem);

        const index = visibleChildren.length - i - 1;
        WF.editItemName(visibleChildren[index]);
        focusedItem = WF.focusedItem();
        setCursorAt(currentOffset);
    }


}

function openFocusedItemURL()
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
        const focusedItemName = focusedItem.getName();
        // console.log("Name; " + focusedItemName);
        const focusedItemNote = focusedItem.getNote();
        // console.log("Note; " + focusedItemNote);
        if(strippedHref.includes("workflowy.com/#/"))
        {
            const shortID = strippedHref.substring(strippedHref.lastIndexOf("/") + 1, strippedHref.length);
            const itemID = WF.shortIdToId(shortID);
            const desiredItem = WF.getItemById(itemID);
            if(desiredItem)
            {
                PrevEnterItem = WF.currentItem();
                WF.zoomTo(desiredItem);
                WF.editItemName(desiredItem);
                // console.log("using our solution");
            }
        }
        else if(IsFocusingOnLink())
        {
            // let workflowy handle it
            // console.log("let workflowy handle it");
            goToInsertMode();
            goToNormalMode();
        }
        else if(focusedItemName.includes(strippedHref) || focusedItemNote.includes(strippedHref))
        {
            var win = window.open(contentHref, '_blank');
            win.focus();
        }
    }
}

function ZoomToMirroredItemsParent()
{
    var focusedItem = WF.focusedItem();

    if(!focusedItem)
        return;

    if(!IsMirror(focusedItem))
        return;

    const desiredItem = GetMirroredItem(focusedItem);

    if(!desiredItem)
        return;

    PrevEnterItem = WF.currentItem();
    WF.zoomTo(desiredItem);

    var desiredParent = desiredItem.getParent();
    if (!desiredParent)
        return;

    if (desiredParent.isExpanded() === false)
        WF.expandItem(desiredParent);

    WF.zoomOut(desiredItem);
    WF.editItemName(desiredItem);
}

function CopySelectionToClipboard()
{
    const focusedItem = WF.focusedItem();

    // the command is executed manually because 
    // we need to react to it, so it needs to 
    // happens in this order.
    document.execCommand('copy');
    // e.preventDefault()
    // e.stopPropagation()

    goToNormalMode();

    WF.editItemName(focusedItem);
    setCursorAt(state.get().anchorOffset);

    // requestAnimationFrame(fixFocus);
}

function IsItemFocusable(itemToQuery)
{
    if (!itemToQuery)
        return false;

    const itemElement = itemToQuery.getElement();
    if(!itemElement)
        return false;

    return true;
}

function FindBottomMostFocusableChildItem(itemToQuery)
{
    if(!IsItemFocusable(itemToQuery))
        return;

    // if(!itemToQuery.isExpanded())
    //     return itemToQuery;

    var bottomMostItem = itemToQuery;

    const kids = itemToQuery.getVisibleChildren();
    for (var i = 0; i < kids.length; ++i)
    {
        if (kids[i].isExpanded())
        {
            var bottomMostRecursiveItem = FindBottomMostFocusableChildItem(kids[i]);
            if(bottomMostRecursiveItem)
            {
                bottomMostItem = bottomMostRecursiveItem;
            }
        }
    }

    return bottomMostItem;
}

function FindBottomMostVisibleChildItemInViewport(itemToQuery)
{
    if(!IsItemInViewport(itemToQuery))
        return;

    // if(!itemToQuery.isExpanded())
    //     return itemToQuery;

    var bottomMostItem = itemToQuery;

    const kids = itemToQuery.getVisibleChildren();
    for (var i = 0; i < kids.length; ++i)
    {
        if (kids[i].isExpanded())
        {
            var bottomMostRecursiveItem = FindBottomMostVisibleChildItemInViewport(kids[i]);
            if(bottomMostRecursiveItem)
            {
                bottomMostItem = bottomMostRecursiveItem;
            }
        }
    }

    return bottomMostItem;
}

function IsItemInViewport(item)
{
    if(!item)
        return false;

    const itemElement = item.getElement();
    if(!itemElement)
        return false;

    const rect = itemElement.getBoundingClientRect();

    return rect.top >= 0 && rect.top <= window.innerHeight;
}

function IsEntireItemVisible(itemToQuery)
{
    if(!IsItemInViewport(itemToQuery))
        return false;

    if(!itemToQuery.isExpanded())
        return true;

    const kids = itemToQuery.getVisibleChildren();
    for (var i = 0; i < kids.length; ++i)
    {
        if(!IsEntireItemVisible(kids[i]))
        {
            return false;
        }
    }

    return true;
}

function IsBottomMostChildFocusable(itemToQuery)
{
    if(!IsItemFocusable(itemToQuery))
        return false;

    if(!itemToQuery.isExpanded())
        return true;

    const kids = itemToQuery.getVisibleChildren();
    if(kids.length > 0)
    {
        const finalIndex = kids.length - 1;
        return IsBottomMostChildFocusable(kids[finalIndex]);
    }

    return true;
}

function IsEntireItemFocusable(itemToQuery)
{
    if(!IsItemFocusable(itemToQuery))
        return false;

    if(!itemToQuery.isExpanded())
        return true;

    const kids = itemToQuery.getVisibleChildren();
    var i = kids.length;
    while(i--)
    {
        if (!IsEntireItemFocusable(item[i]))
        {
            return false;
        }
    }

    return false;
}

function ContainsLink(itemToQuery)
{
    if(!itemToQuery)
        return false;

    const itemElement = itemToQuery.getElement();

    const firstContentLink = itemElement.getElementsByClassName('contentLink')[0]; 
    if(!firstContentLink)
        return false;

    return true;
}

function IsFocusingOnLink()
{
    // check if the cursor is focusing on a link
    const currentOffset = calculateCursorOffset(true);
    const focusedString = GetFocusedItemString();
    const substring_Start = focusedString.substring(0, currentOffset);
    const substring_End = focusedString.substring(currentOffset);
    const Tags_substring_Start = substring_Start.match(/(<\/a>)|(<a)/g);
    const Tags_substring_End = substring_End.match(/(<\/a>)|(<a)/g);

    // console.clear();
    // console.log("Start has link: " + Tags_substring_Start);
    // console.log("End has link: " + Tags_substring_End);
    // console.log("Substring START: " + substring_Start);
    // console.log("Substring END: " + substring_End);
    // console.log("isfocusing on Note: " + IsFocusingOnNote());
    // console.log("isfocusing on Name: " + IsFocusingOnName());

    // console.log(focusedItem.getElement());
    // console.log(document.activeElement);
    // console.log(document.activeElement.parentElement.className);

    if(!Tags_substring_Start || !Tags_substring_End)
        return false;
    else
        return true;
}

function HandleJumpTo()
{
    if(state.get().mode !== Mode.INSERT)
    {
        /* 	
            The workflowy binding has a primary and secondary 
            behaviour depending on the state of the item: 

            The primary behaviour is to edit existing links
            found in the item. 

            Secondary is to open the 
            workflowy Jump-To-Item-Menu.
        */

        const focusedItem = WF.focusedItem();
        if(!focusedItem)
            return;

        const bLinkFocus = IsFocusingOnLink();
        // console.log("has link focus: " + bLinkFocus);

        if(!bLinkFocus)
        {
            // prevent link editing from triggering
            const selection = document.getSelection();
            selection.removeAllRanges();

            // needed in order to regain focus after interacting with the menu
            focusPreJumpToItemMenu = focusedItem;
        }

        goToInsertMode();
    }
    else    // INSERT MODE
    {
		var focusedItem = WF.focusedItem();
		if(!focusedItem)
			return;

		// console.log("link focus: " + IsFocusingOnLink());

        const cursorSelection = document.getSelection();
        const anchorPos = cursorSelection.anchorOffset;
        const focusPos = cursorSelection.focusOffset;
        const cursorSelectionDelta = Math.abs(anchorPos-focusPos);

		// we don't support link editing within the note, 
        // while in insert mode, due to how the 
        // cursor movement works atm
		if(cursorSelectionDelta === 0 && (IsFocusingOnNote() || !IsFocusingOnLink()))
		{
			focusPreJumpToItemMenu = WF.focusedItem();

            // !!! this will prevent link editing when selecting text with mouse
			// const selection = document.getSelection();
			// selection.removeAllRanges();
			// goToInsertMode();
		}
    }
}

// either .name or .note
function GetFocusedItemStringInPlainText()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return "";

    if(IsFocusingOnName())
        return focusedItem.getNameInPlainText();

    if(IsFocusingOnNote())
        return focusedItem.getNoteInPlainText();

    // console.error("failed to get focused item note string");

    return "";
}

// either .name or .note
function GetFocusedItemString()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return "";

    if(IsFocusingOnName())
        return focusedItem.getName();

    if(IsFocusingOnNote())
        return focusedItem.getNote();

    // console.error("failed to get focused item name string");

    return "";
}

function IsFocusingOnName()
{
    const focusedClassName = GetFocusedClassName();
    if(focusedClassName)
        return focusedClassName.includes("name");

    return false;
}

function IsFocusingOnNote()
{
    const focusedClassName = GetFocusedClassName();
    if(focusedClassName)
        return focusedClassName.includes("note");

    return false;
}

function GetFocusedClassName()
{
    const focusedItem = WF.focusedItem();
    if(!focusedItem)
        return null;

    // console.log("focus is valid");

    if(!focusedItem.getElement())
        return null;

    // console.log("element is valid");
    
    if(!document.activeElement)
        return null;

    // console.log("active element is valid");

    if(!document.activeElement.parentElement)
        return null;

    // console.log("active parent element is valid");

    const foundClassName = document.activeElement.parentElement.className;

    // console.log("found class name: " + foundClassName);

    return foundClassName;
}

function OutdentFocusedItems(e)
{
    if(WF.getSelection().length <= 0)
    {
        outdentFocusedItem(e);
    }
    else
    {
        enterVisualMode();
        outdentSelection(e);
        ExitVisualMode();
        event.preventDefault()
        event.stopPropagation()
    }
}

function IndentFocusedItems(e)
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
        event.preventDefault()
        event.stopPropagation()
    }
}


