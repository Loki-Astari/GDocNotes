// ==UserScript==
// @name         Google Docs Note Taker
// @namespace    http://LokiAstari.com/
// @version      0.9
// @description  Link a private google doc to any web page. Link multiple pages to a single note.
// @author       Loki Astari
// @match        https://docs.google.com/document/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        unsafeWindow
// @noframes
// @sandbox      JavaScript
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/*
 * Definitions:
 * ============
 * URLLight:      A URL with the query and fragment stripped.
 * Page:          A google docs URLLight.
 * Note:          A google docs URLLight that is known to be the "Note" of a "Page"
 * Notes Pages:   A list of all "Note" pages.
 *
 * Description:
 * ============
 *
 * For a "Page"
 *     We can associate a "Note".
 * The same "Note" can be associated with multiple pages.
 * A "Note" can also be a "Page" (i.e. a Note can have a note associated with it forming a crude hierarchy)
 *
 * If a "Page" does NOT have an associted "Note" we display:
 *     * The "Add Notes" button allowing. If clicked the user can add a URL as the "Note" of this "Page".
 *     * A list of known "Notes Pages". If clicked will associate the "Note" with this page.
 *
 * If a "Page" does have an associated "Note" we display:
 *     * A list of "Pages" that are all associated with the same "Note"
 *
 * If a current page is a "Note" we display:
 *     * A list of "Pages" that are associated with this "Note".
 *
 * */
(function() {
    // To get a StorageInterface call
    // Storage.sessionStart(action)
    //    Action => function(StorageInterface)
    //        Action is a callback that is passed a storage interface as its parameter.
    //        Returning null/undefined/false => results in nothing else happening.
    //        Returning true: forces any changes made to be persisted.
    //        Returning an array:
    //            if the first element is "true" save any changes.
    //            return the second value as a result from Storage.sessionStart().
    //
    // This was done because I wanted to note serialize/deserialize the data from
    // "localStorage" every time I accessed any persisted data but did want to make
    // sure that I did not accidently forget to put any changes back.
    class StorageInterface {
        constructor(storeObject) {
            this.pages = storeObject.pages;
            this.notes = storeObject.notes;
        };
        // Public
        static GDNTStorageNoteDefaultDisplay = '* Note Waiting For Title *';

        // Public
        getPageNotes(page) {
            if (!this.pages.hasOwnProperty(page)) {
                // This is the main object that can be interacted with externally.
                // The other interface usually return this.
                this.pages[page] = {note: ''};
            }
            return this.pages[page];
        };

        // Public
        delPageNote(page) {
            delete this.pages[page];
        };

        // Public
        getNotesInfo(note) {
            var find = this.notes.filter(obj => obj.note == note);
            if (find.length == 0) {
                // This is the main object that can be interacted with externally.
                // The other interface usually return this.
                this.notes.push({note: note, display: StorageInterface.GDNTStorageNoteDefaultDisplay, linkedPages: []});
                find = this.notes.filter(obj => obj.note == note);
            }
            return find[0];
        };

        // Public
        findNoteInfo(note) {
            var find = this.notes.filter(obj => obj.note == note);
            return find.length == 0 ? {note: '', display:'', linkedPages: []} : find[0];
        };

        // Public
        delNoteInfo(note) {
            this.notes = this.notes.filter(obj => obj.note != note);
        };

        // Public
        setPageNotesData(page, note) {
            const pageData = this.getPageNotes(page);
            if (pageData.note) {
                const notesDate = this.getNotesInfo(pageData.note);
                notesDate.linkedPages = notesDate.linkedPages.filter(obj => obj.page != page);
            }
            if (note) {
                pageData.note = note;
                const notesData = this.getNotesInfo(pageData.note);
                const filterPages = notesData.linkedPages.filter(obj => obj.page == page);
                if (filterPages.length == 0) {
                    notesData.linkedPages.push({page: page, display: cleanTitle(document.title)});
                }
            }
            else {
                this.delPageNote(page);
            }
        };
        // Public
        getNoteData(page) {
            const pageData = this.getPageNotes(page);
            return pageData.note == '' ? {display:'', linkedPages:[]} : this.getNotesInfo(pageData.note);
        };
        // Public
        getPageData(page) {
            return this.getPageNotes(page);
        };
        // Public
        getListAllNotes() {
            return this.notes;
        };
    };

    const cleanUrl = function(url) {
        return url.split('?')[0].split('#')[0];
    }
    const cleanTitle = function(title) {
        return title.split(' - Google Docs')[0];
    }
    const currentPage = cleanUrl(window.location.href);

    // The main access to the persisted state.
    // Any user action should only call one method on "Storage"
    // If you need to make multiple calls then sessionStart() see above
    // You can perform multiple actions on the storage state before returning.
    const Storage = {
        // Private
        GDNTStorageName: 'GDNTPageData',
        // Private
        getGDNTData: function() {
            const GDNTStorageText = localStorage.getItem(this.GDNTStorageName);
            return JSON.parse(GDNTStorageText || '{"pages":{}, "notes":[]}');
        },
        // Private
        setGDNTData: function(newValue) {
            localStorage.setItem(this.GDNTStorageName, JSON.stringify(newValue));
        },

        // Private: Internally used by sessionStart
        seaasionInUse: false,
        // Public
        sessionStart: function(action) {
            if (this.seaasionInUse) {
                // Should wait (otherwise we will loose data)
                // But very low chance of that happening as there is only one async call
                // See: UI.saveNotePage (Call to ajax has a callback function)
                // TODO:
            }
            this.seaasionInUse = true;
            const session = new StorageInterface(this.getGDNTData());
            const result = action(session);
            if (result === undefined || result === null || result === false) {
                return;
            }
            if (result === true) {
                this.setGDNTData({pages: session.pages, notes: session.notes});
                return;
            }
            if (result.constructor === Array) {
                if (result.length > 0 && result[0] === true) {
                    this.setGDNTData({pages: session.pages, notes: session.notes});
                }
                if (result.length > 1) {
                    return result[1];
                }
            }
            return;
        },
        // public
        // Uses session
        fixSavedData: function(note, title) {
            this.sessionStart((session) => {
                const notesPage = session.getNotesInfo(note);
                if (notesPage.display != StorageInterface.GDNTStorageNoteDefaultDisplay) {
                    return false;
                }
                notesPage.display = title;
                return true;
            });
        },
        // Public
        // Uses session
        setPageNotes: function(page, notes) {
            this.sessionStart((session) => {
                session.setPageNotesData(page, notes);
                return true;
            });
        },
        // Public
        // Uses session
        getPageNoteInfo: function(page) {
            return this.sessionStart((session) => {
                const pageData = session.getPageNotes(page);
                return [false, pageData.note];
            });
        },
        // Public
        // Uses session
        delNote: function(note) {
            this.sessionStart((session) => {
                console.log("Delete Note >" + note + "<");
                const noteData = session.getNotesInfo(note);
                for (const page of noteData.linkedPages) {
                    console.log("Delete Page: >" + page.page + "<");
                    session.delPageNote(page.page);
                }

                session.delNoteInfo(note);
                console.log("Session: " + JSON.stringify(session));
                return true;
            });
        },
    };

    // All user interactions (event handlers) are here.
    // Each event handler should only call one method on "Storage"
    // otherwise you are serializing and de-serializing the persisted
    // state on each call.
    const UI = {
        // Private
        saveNotePage: function(note) {
            if (note == currentPage) {
                return null;
            }
            Storage.setPageNotes(currentPage, note);
            $.ajax({
                method: 'HEAD',
                url: note,
                success: function(pageHead) {
                    const title = cleanTitle($(pageHead).filter('title').text());
                    if (title) {
                        Storage.fixSavedData(note, title);
                    }
                }
            });
            return note;
        },
        // Private
        askUserForNotesPage: function() {
            return prompt('URL of NotePage: ', 'https://docs.google.com/document/d/');
        },
        // Private
        getNotePage: function(notes) {
            if (!notes) {
                return null;
            }
            notes = cleanUrl(notes);
            return this.saveNotePage(notes);
        },
        // Private
        addNotes: function(notes) {
            notes = this.getNotePage(notes);
            this.addUI(currentPage);
        },
        // Event Handler
        delPageNoteClick: function(event, page) {
            Storage.setPageNotes(page, '');
            this.addUI(currentPage);
        },
        // Event Handler
        delNoteClick: function(event, note) {
            const confirmDelete = confirm(`
Deleting a Note will delete all linking pages from the internal DB.
Are you sure?`);
            if (confirmDelete) {
                Storage.delNote(note);
                this.addUI(currentPage);
            }
        },
        // Event Handler
        openNotesClick: function(event) {
            if (event.shiftKey) {
                this.getNotePage(this.askUserForNotesPage());
                return;
            }
            if (event.altKey) {
                Storage.setPageNotes(currentPage, '');
                this.addUI(currentPage);
                return;
            }
            window.open(Storage.getPageNoteInfo(currentPage), '_blank');
        },
        // Event Handler
        addNotesClick: function(event) {
            this.addNotes(this.askUserForNotesPage());
        },
        // Event Handler
        addNotesClickPageClick: function(event, notes) {
            this.addNotes(notes);
        },
        // Event Handler
        refreshNotesClick: function(event) {
            this.addUI(currentPage);
        },
        // Init and refresh the UI.
        addUI: function(page)
        {
            GM_addStyle ( `
                #GDNTContainer {
                    position:               static;
                    font-size:              12px;
                    background:             orange;
                    border:                 1px outset black;
                    margin:                 1px;
                    padding:                5px 5px;
                    opacity:                0.7;
                    z-index:                1100;
                }
                #GDNTButton {
                    cursor:                 pointer;
                }
            `);
            const storageData = Storage.sessionStart((session) => {
                const pageData = session.getPageData(page);
                const pageNote = session.findNoteInfo(page);
                const noteData = session.getNoteData(page);
                const notesList = session.getListAllNotes();
                return [false, {pageData: pageData, pageNote: pageNote, noteData: noteData, notesList: notesList}];
            });

            const hasNote = storageData.pageData.note != '';
            console.log(`
                pageData:            ${JSON.stringify(storageData.pageData)}
                pageNote.isNote:     ${storageData.pageNote.linkedPages.length ? true : false}
                pagesOnNoteList:     ${storageData.noteData.linkedPages.length}
                notesList:           ${storageData.notesList.length}
                pageNote.linkedPages:${storageData.pageNote.linkedPages.length}
                noteData.likkedPages:${storageData.noteData.linkedPages.length}
                hasNote:             ${hasNote}
            `);

            const blockText_P1 = `
                <div><input type="button" class="GDNTButton" value="Refresh" id="GDNTNotesRefrButton" /></div>
                <div><input type="button" class="GDNTButton" value="Open Notes: ${storageData.noteData.display}" id="GDNTNeedsNote" style="display:${hasNote ? 'block' : 'none'}" /></div>
                <div id="GDNTHasNote" class="GDNTContainer"  style="display:${hasNote ? 'none' : 'block'}">
                    <div>This page does not have a note:</div>
                    <ul>
                        <input type="button" class="GDNTButton" value="Add Notes" id="GDNTNotesListButton" />`
            const blockText_P2 = `
                    </ul>
                </div>
                <div class="GDNTContainer"  style="display:${storageData.pageNote.linkedPages.length ? 'block' : 'none'}">
                    <div>This is the Notes Page for:</div>
                    <ul>`;
            const blockText_P3 = `
                    </ul>
                </div>
                <div class="GDNTContainer"  style="display:${storageData.noteData.linkedPages.length ? 'block' : 'none'}">
                    <div>Other Pages that share the same Note:</div>
                    <ul>`;
            const blockText_P4 = `
                    </ul>
                </div>`;
            const deleteIcon = 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/16/sign-error-icon.png';
            var list1 = '';
            for (const linkPage of storageData.notesList) {
                list1 += `<li><img class="DeleteNote" value="${linkPage.note}" src="${deleteIcon}"/><a class="NotesPage" value="${linkPage.note}">${linkPage.display}</a></li>`;
            }
            var list2 = '';
            for (const linkPage of storageData.pageNote.linkedPages) {
                list2 += `<li><img class="DeletePageNote" value="${linkPage.page}" src="${deleteIcon}"/><a href="${linkPage.page}">${linkPage.display}</a></li>`;
            }
            var list3 = '';
            for (const linkPage of storageData.noteData.linkedPages) {
                list3 += `<li><img class="DeletePageNote" value="${linkPage.page}" src="${deleteIcon}"/><a href="${linkPage.page}">${linkPage.display}</a></li>`;
            }

            const findBlock = document.getElementById('GDNTNotesContainer');
            var block;
            if (findBlock == null) {
                block = document.createElement('div');
                block.setAttribute ('id', 'GDNTNotesContainer');

                const parent = document.getElementsByClassName('left-sidebar-container')[0];
                const child = parent.getElementsByClassName('left-sidebar-container-content')[0];

                parent.insertBefore(block, child);
            }
            else {
                block = findBlock;
            }

            block.innerHTML = blockText_P1 + list1 + blockText_P2 + list2 + blockText_P3 + list3 + blockText_P4;

            // Note: This function is called after these elements are loaded (see waitForKeyElements below)
            document.getElementById('GDNTNotesRefrButton').addEventListener('click', (event) => {UI.refreshNotesClick(event);});
            document.getElementById('GDNTNeedsNote').addEventListener('click', (event) => {UI.openNotesClick(event);});
            document.getElementById('GDNTNotesListButton').addEventListener('click', (event) => {UI.addNotesClick(event);});
            for (const link of document.getElementsByClassName('NotesPage')) {
                link.addEventListener('click', (event) => {UI.addNotesClickPageClick(event, link.getAttribute('value'));});
            }
            for (const link of document.getElementsByClassName('DeleteNote')) {
                link.addEventListener('click', (event) => {UI.delNoteClick(event, link.getAttribute('value'));});
            }
            for (const link of document.getElementsByClassName('DeletePageNote')) {
                link.addEventListener('click', (event) => {UI.delPageNoteClick(event, link.getAttribute('value'));});
            }

        }
    };
    const resetItem = false;
    if (resetItem) {
        console.log('Info Before: => ' + JSON.stringify(localStorage.getItem(Storage.GDNTStorageName)));
        localStorage.removeItem(Storage.GDNTStorageName, undefined);
        console.log('Info After:  => ' + localStorage.getItem(Storage.GDNTStorageName));
    }
    Storage.sessionStart((session) => {
        console.log('Storage: ' + JSON.stringify(session, null, 4));
    });
    // Wait for particular DOM elements to exist before starting up my code.
    // Basically the google docs page has to execute some code to add the different parts of the document.
    // This waits until those parts of the document exist then adds this UI into the middle of that.
    waitForKeyElements('div.left-sidebar-container div.left-sidebar-container-content', () => {UI.addUI(currentPage);});
})();


