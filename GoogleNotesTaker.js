// ==UserScript==
// @name         Google Docs Note Taker
// @namespace    http://LokiAstari.com/
// @version      0.2
// @description  Link a private google doc to any web page. Link multiple pages to a single note.
// @author       Loki Astari
// @match        https://docs.google.com/document/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @noframes
// @sandbox      JavaScript
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==



(function() {
const payLoad = function() {
    const currentPage = window.location.href.split('?')[0].split('#')[0];
    const ButtonTextActive = "GNote";
    const ButtonTextInActive = "Add GNote";
    const NotesPageStorage = 'NotePage:' + currentPage;
    var NotesPage = localStorage.getItem(NotesPageStorage);
    const LinkedPagesStorage = 'LinkedPages:' + NotesPage;
    var linkedPagesText = localStorage.getItem(LinkedPagesStorage);
    var linkedPages = JSON.parse(linkedPagesText || '[]');

    // Note: This function is called after these elements are loaded (see below)
    const parent = document.getElementsByClassName('left-sidebar-container')[0];
    const child = parent.getElementsByClassName('left-sidebar-container-content')[0];


    GM_addStyle ( `
    #myContainer {
        position:               static;
        font-size:              12px;
        background:             orange;
        border:                 1px outset black;
        margin:                 1px;
        padding:                5px 5px;
        opacity:                0.7;
        z-index:                1100;
    }
    #myButton {
        cursor:                 pointer;
    }
` );
    // URL: Remove query and fragment.


    //alert('Count: ' + find.length);
    function showNotePageClick(event) {
        if (event.shiftKey) {
            getNotePage();
            return;
        }
        window.open(NotesPage, '_blank');
    }
    function getNotePageClick(event) {
        if (getNotePage()) {
            var button = document.getElementById("myButton")
            button.value=ButtonTextActive;
            button.removeEventListener("click", getNotePageClick);
            button.addEventListener("click", showNotePageClick);
        }
    }
    function getNotePage() {
        var page = prompt("URL of NotePage: ", "https://docs.google.com/document/d/");
        if (page) {
            NotesPage = page;
            localStorage.setItem(NotesPageStorage, NotesPage);
        }
        return page;
    }
    //alert('Page: ' + currentPage);
    var buttonText;
    var buttonFunction;
    if (NotesPage) {
        buttonText = ButtonTextActive;
        buttonFunction = showNotePageClick;
    }
    else {
        buttonText = ButtonTextInActive;
        buttonFunction = getNotePageClick;
    }
    var block = document.createElement('div');
    block.setAttribute ('id', 'myContainer');
    var innerText = '<input type="button" value="' + buttonText +'" id="myButton"/><ul>';
    for (const page in linkedPages) {
        innerText += '<li>' + page + '<li>';
    }
    innerText += '</ul>';
    block.innerHTML= innerText;
    parent.insertBefore(block, child);
    document.getElementById ("myButton").addEventListener("click", buttonFunction);
};

waitForKeyElements("div.left-sidebar-container div.left-sidebar-container-content", payLoad);

})();
