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
// @require      https://raw.githubusercontent.com/Loki-Astari/TampermonkeyScripts/master/GoogleNotesTaker/UI.js#sha384=TRKVtP91j4B5qAQFBUwb487cX87yTUMBuPkjYt7S+AKCDX4O0s/b/lppq9C59RUq%
// ==/UserScript==

(function() {
     GoogleDocsNoteTaker();
})();
