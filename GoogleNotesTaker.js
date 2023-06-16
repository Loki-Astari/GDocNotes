// ==UserScript==
// @name         Google Docs Note Taker
// @namespace    http://LokiAstari.com/
// @version      0.15
// @description  Link a private google doc to any web page. Link multiple pages to a single note.
// @author       Loki Astari
// @license      MIT
// @match        https://docs.google.com/document/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        unsafeWindow
// @noframes
// @sandbox      JavaScript
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js#sha384=Q96qXpLdPU1SBEdvTZkaSZfHRsUwS+sj/WFUdmYvGhBNtwYUucjuwhZT6glwdVXk%
// @require      https://raw.githubusercontent.com/Loki-Astari/TampermonkeyScripts/master/GoogleNotesTaker/Util.js#sha384=TRKVtP91j4B5qAQFBUwb487cX87yTUMBuPkjYt7S+AKCDX4O0s/b/lppq9C59RUq%
// @require      https://raw.githubusercontent.com/Loki-Astari/TampermonkeyScripts/master/GoogleNotesTaker/StorageInterface.js#sha384=TRKVtP91j4B5qAQFBUwb487cX87yTUMBuPkjYt7S+AKCDX4O0s/b/lppq9C59RUq%
// @require      https://raw.githubusercontent.com/Loki-Astari/TampermonkeyScripts/master/GoogleNotesTaker/Storage.js#sha384=TRKVtP91j4B5qAQFBUwb487cX87yTUMBuPkjYt7S+AKCDX4O0s/b/lppq9C59RUq%
// @require      https://raw.githubusercontent.com/Loki-Astari/TampermonkeyScripts/master/GoogleNotesTaker/UIBuilder.js#sha384=TRKVtP91j4B5qAQFBUwb487cX87yTUMBuPkjYt7S+AKCDX4O0s/b/lppq9C59RUq%
// @require      https://raw.githubusercontent.com/Loki-Astari/TampermonkeyScripts/master/GoogleNotesTaker/UI.js#sha384=TRKVtP91j4B5qAQFBUwb487cX87yTUMBuPkjYt7S+AKCDX4O0s/b/lppq9C59RUq%
// ==/UserScript==

(function() {
    const storage = new Storage();

    const uiBuilder = new UIBuilder();

    const ui = new UI(storage, uiBuilder, Util.cleanUrl(window.location.href));

    // Wait for particular DOM elements to exist before starting up my code.
    // Basically the google docs page has to execute some code to add the different parts of the document.
    // This waits until those parts of the document exist then adds this UI into the middle of that.

    waitForKeyElements('div.left-sidebar-container div.navigation-widget-smart-summary-container', () => {ui.createUI();});

})();
