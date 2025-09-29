
var scripts = [ 
    "state.js",
    "TimeTagCounter.js",
    "easyMotion.js",
    "cursorMovement.js",
    "vimflowyFunctionLibrary.js"
    ];

for (var i=0; i < scripts.length; i++) 
{
    //console.log("-- SCRIPTS LOADING -- ")
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(scripts[i]);
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() 
    {
        //console.log("-- REMOVING FROM PARENT -- ")
        this.parentNode.removeChild(this);
    };
}
