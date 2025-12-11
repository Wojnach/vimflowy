
const {flashMode, goToInsertMode, goToNormalMode, goToVisualMode, goToReplaceMode, goToFindMode, goToInnerMode, goToAfterMode} = modeClosure(state.get, state.set);

// vimflowy.js (self-bootstrapping, with retry)
(() => {
  let bootstrapped = false;
  let tries = 0;
  const MAX_TRIES = 100;      // ~10s if interval is 100ms
  const RETRY_MS  = 100;

  function init() 
  {
    if (bootstrapped) 
      return;

    const mainContainer = document.getElementById('app');
    if (!mainContainer) 
    {
      if (tries < MAX_TRIES) 
      {
        tries += 1;
        setTimeout(init, RETRY_MS);
      } 
      else 
      {
        console.warn('#app not found after retries; giving up.');
      }
      return; 
    }

    // we have the #app, lets wire the rest.
    requestAnimationFrame(fixFocus);
    //requestAnimationFrame(() => setTimeout(fixFocus, 0));

    mainContainer.addEventListener('mousedown', mouseClickIntoInsertMode);
    mainContainer.addEventListener('keyup', HandleKeyup);
    mainContainer.addEventListener('keydown', HandleKeydown);

    bootstrapped = true; 
  }

  if (document.readyState === 'loading') 
  {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } 
  else 
  {
    init();
  }

  // Back-compat: if anything still calls WFEventListener("documentReady") that I'm not aware of
  window.WFEventListener = (event) => { if (event === 'documentReady') init(); };
})();

function HandleKeyup(event)
{
  HandleEasyMotion_KeyUp();
  reselectItemsBeingMoved();
  updateKeyBuffer_Keyup(event);

  // cursor focus loss will be regained upon pressing ESC
  // This can happen when the cursor navigates over or 
  // into animating items (close/open/completed/etc)
  // if (!WF.focusedItem()
  // &&  state.get().mode !== Mode.INSERT
  // &&  event.key == key_Esc)
  // {
  //   WF.editItemName(WF.currentItem());
  // }

  // console.log("-- KeyUP event -- ")
}

function HandleKeydown(event)
{
    //console.log("-- KeyDOWN event -- ")

    // Skip vimflowy handling when a Workflowy popup/menu is active (e.g., Move To menu)
    // Use Workflowy's popups service to detect active popups
    const popupsService = window.ioc && window.ioc.maybe && window.ioc.maybe('popups');
    const hasActivePopup = popupsService && popupsService.current;

    if (hasActivePopup || window._vimflowyMoveToActive || window._vimflowyJumpToActive) {
      // Allow Escape and Enter to close the menu and return to normal mode
      if (event.key === 'Escape' || event.key === 'Esc') {
        setTimeout(() => {
          window._vimflowyMoveToActive = false;
          window._vimflowyJumpToActive = false;
          // Restore focus to current item before returning to normal mode
          const currentItem = WF.currentItem();
          if (currentItem && !WF.focusedItem()) {
            WF.editItemName(currentItem);
          }
          goToNormalMode();
        }, 50);
        return; // Let Escape propagate to close the popup
      } else if (event.key === 'Enter') {
        setTimeout(() => {
          window._vimflowyMoveToActive = false;
          window._vimflowyJumpToActive = false;
          // Restore focus to current item before returning to normal mode
          const currentItem = WF.currentItem();
          if (currentItem && !WF.focusedItem()) {
            WF.editItemName(currentItem);
          }
          goToNormalMode();
        }, 100);
        return; // Let Enter propagate to confirm the action
      } else {
        // Let all other keys pass through to the popup
        return;
      }
    }

    if(HandleEasyMotion_KeyDown(event))
    {
      // console.log("-- HandleEasyMotion early out -- ")
      event.preventDefault()
      event.stopPropagation()
      return;
    }

    if(updateKeyBuffer_Keydown(event))
    {
      // console.log("-- KeybufferDownKey early out -- ")
      event.preventDefault()
      event.stopPropagation()
      return;
    }

    if (state.get().mode === Mode.FIND)
    {
      event.preventDefault()
      event.stopPropagation()
      handleFindMode(event);
    }
    else if (state.get().mode === Mode.REPLACE)
    {
      event.preventDefault()
      event.stopPropagation()
      handleReplaceMode(event);
    }
    else if (state.get().mode === Mode.INNER)
    {
      event.preventDefault()
      event.stopPropagation()
      handleInnerMode(event);
    }
    else if (state.get().mode === Mode.AFTER)
    {
      event.preventDefault()
      event.stopPropagation()
      handleAfterMode(event);
    }
    else if (keyBuffer.length > 1 && transparentActionMap[state.get().mode][keyBuffer[keyBuffer.length-2]+keyBuffer[keyBuffer.length-1]]) 
    {
      // handle sequence bindings
      transparentActionMap[state.get().mode][keyBuffer[keyBuffer.length-2]+keyBuffer[keyBuffer.length-1]](event);
      keyBuffer = [];
      // console.log("-- Sequence Map -- ")
    }
    else if (actionMap[state.get().mode][keyFrom(event)]) 
    {
      // handle simple bindings that always block propagation
      actionMap[state.get().mode][keyFrom(event)](event.target)
      event.preventDefault()
      event.stopPropagation()
      // console.log("-- Action Map -- ")
    }
    else if (transparentActionMap[state.get().mode][keyFrom(event)]) 
    {
      // handle bindings that sometimes block propagation
      transparentActionMap[state.get().mode][keyFrom(event)](event)
      // console.log("-- Transparent Map -- ")
    }
    else
    {
      preventKeystrokesWhileNavigating(event);
      // console.log("-- Preventing defaults -- ")
    }

    if(bShowTimeCounter)
        updateTimeTagCounter();

    // console.log("currentOffset keydown: " + state.get().anchorOffset);
}

// we can't use WF.getSelection()
// because WF.setSelection() will 
// remove any of the added items 
// if they are children of any 
// of the other items which were added
let VisualSelectionBuffer = [];
let PrevEnterItem = null;
let SelectionPreMove = [];
let InitialSelectionItem = null;
let focusPreJumpToItemMenu = null;
let bKeyDownHasFired = false;
let bShowTimeCounter = false;
let keyBufferTempCopy = [];
let keyBuffer = [];
let yankItemBuffer_Copies = [];     // contains data for items (item.data)
let yankItemBuffer_Duplicates = []; // contains actual items
const validSearchKeys = '1234567890[{]};:\'",<.>/?\\+=_-)(*&^%$#@~`!abcdefghijklmnopqrstuvwxyzäåöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ ';
const validInputKeys =  '1234567890[{]};:\'",<.>/?\\+=_-)(*&^%$#@~`!abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ';
const key_Slash = "/"//55;
const key_Esc = "Escape"//27;
const modifierKeyCodesToIgnore = ['Shift', 'Control', 'Alt', 'Meta'];  
