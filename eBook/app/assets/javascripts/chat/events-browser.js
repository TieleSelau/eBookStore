/*
Adaptação de: Jappix - An open social platform
Estes são os JS scripts para suporte ao Atheneum Chat
-------------------------------------------------
Author: Gregory Silva
Last revision: 30/08/11
*/

var keyCd, altKy, ctrlKy, shiftKy, mouseBtn
var ANCHOR_CLICK = true
window.onload = loadLinks
if (BrowserDetect.browser == 'Opera') 
    history.navigationMode = 'compatible'
function loadLinks() {
    document.onmousedown = getMouseButton;
    document.onkeydown = getKeyCode;
    var aList = document.getElementsByTagName('a');
    if (aList && aList.length > 0) {
        for (i = 0; i < aList.length; i++) {
            var a = aList[i];
            if (checkForLocal(a.href))
                a.onclick = setAClick;
            else
                a.onclick = cancelAClick;
        }
    }
}
function setAClick() {
    ANCHOR_CLICK = true;
}
function cancelAClick() {
    ANCHOR_CLICK = false;
}
function checkForLocal(src) {
    return (src.indexOf("localhost") != -1 || src.indexOf(HOST_MAIN) != -1 || src.indexOf("javascript") != -1 || 
            src.indexOf("mailto") != -1 || src.indexOf("#") == 0);
}
function getKeyCode(event) {
    if (BrowserDetect.browser == 'Explorer') { 
        keyCd = event ? event.keyCode : window.event.keyCode;
        altKy = event ? event.altKey : window.event.altKey;
        ctrlKy = event ? event.ctrlKey : window.event.ctrlKey;
        shiftKy = event ? event.shiftKey : window.event.shiftKey;
    }
    else {
        if (event.which == null)
            keyCd = event.keyCode;
        else
            keyCd = event.which;
        altKy = event.altKey;
        ctrlKy = event.ctrlKey;
        shiftKy = event.shiftKey;
    }
    return this;
}
function getMouseButton(event) {
    if (BrowserDetect.browser == 'Explorer')
        mouseBtn = event ? event.button : window.event.button;
    else {
        if (event.which == null)
            mouseBtn = event.button;
        else
            mouseBtn = event.which;
    }
}
function handleClose() {
    if (BrowserDetect.browser == 'Explorer') {
        YHeight = window.event.clientY;
        //Browser Changes the page for another domain
        if (ANCHOR_CLICK == false && !(window.event.keyCode != 0 || mouseBtn == 2 || YHeight < 0))
            disconnectMini();
        //Browser Closes through ALT + F4 buttons || CTRL + F4 || CTRL + W buttons
        if ((altKy == true && keyCd == 115) || (ctrlKy == true && (keyCd == 87 || keyCd == 115)))
            disconnectMini();
    }
    else if (BrowserDetect.browser == 'Opera') {
        //Browser Changes the page for another domain
        if (ANCHOR_CLICK == false && !(window.event.keyCode || mouseBtn == 2))
            disconnectMini();
    }
    // Other Browsers
    else {
        //Browser Changes the page for another domain
        if (ANCHOR_CLICK == false && !(keyCd || mouseBtn == 2))
            disconnectMini();
        //Browser Closes through ALT + F4 buttons || CTRL + F4 || CTRL + W buttons
        if ((altKy == true && keyCd == 115) || (ctrlKy == true && (keyCd == 87 || keyCd == 115)))
            disconnectMini();
    }
}