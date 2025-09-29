// Define an array of supported option keys, which we'll use to fetch the
// options from Chrome storage.
const SUPPORTED_OPTIONS = ['jkToEsc'];
// API that the content script uses to notify page scripts of option changes.
// The function dispatches the custom event defined above, passing the updated
// options as the event detail.
function sendOptions(options) {
    window.dispatchEvent(
        new CustomEvent('optionChangeEvent', { detail: { options }}),
    );
}
// Register an event listener for changes to the extension's options in Chrome
// storage. When the options change, we extract the updated values and send them
// to the page scripts via a custom event.
chrome.storage.onChanged.addListener(function(changes, namespace) {
    sendOptions(
        Object.fromEntries(
            Object.entries(changes).map(([k,v]) => [k, v.newValue])
        )
    )
});

var scripts = [
    "keybindings.js",
    "transparentKeybindings.js",
    "vimflowy.js",
    "options.js"
    ];

let scriptsLoaded = 0;
for (var i=0; i < scripts.length; i++)
{
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(scripts[i]);
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() {
        scriptsLoaded += 1;
        // Once all scripts have loaded, fetch the extension's options from
        // Chrome storage and send them to the page scripts via a custom event.
        if (scriptsLoaded == scripts.length) {
            chrome.storage.sync.get(SUPPORTED_OPTIONS, (options) => {
                sendOptions(options);
            });
        }
        this.parentNode.removeChild(this);
    };
}
