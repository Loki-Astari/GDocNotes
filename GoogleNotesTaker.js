// ==UserScript==
// @name         Google Docs Note Taker
// @namespace    http://LokiAstari.com/
// @version      0.5
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
    const cleanUrl = function(url) {
        return url.split('?')[0].split('#')[0];
    }
    const cleanTitle = function(title) {
        return title.split(' - Google Docs')[0];
    }
    const currentPage = cleanUrl(window.location.href);

    const Storage = {
        // Private
        GDNTStorageName: 'GDNTPageData',
        GDNTStoragePageDefaultDisplay: '*Page*',
        GDNTStorageNoteDefaultDisplay: '* Note Waiting For Title *',
        // Private
        getGDNTData: function() {
            const GDNTStorageText = localStorage.getItem(this.GDNTStorageName);
            return JSON.parse(GDNTStorageText || '{}');
        },
        // Private
        setGDNTData: function(newValue) {
            localStorage.setItem(this.GDNTStorageName, JSON.stringify(newValue));
        },
        // Private
        getPageNotes: function(session, page) {
            if (!session.hasOwnProperty(page)) {
                // This is the main object that can be interacted with externally.
                // The other interface usually return this.
                session[page] = {page: '', display: this.GDNTStorageNoteDefaultDisplay, linkedPages: []};
            }
            return session[page];
        },
        // Private
        setPageNotesData: function(session, page, note) {
            const pageData = this.getPageNotes(session, page);
            if (pageData.page) {
                const notesDate = this.getPageNotes(session, pageData.page);
                notesDate.linkedPages = notesDate.linkedPages.filter(obj => obj.page != page);
            }
            if (note) {
                pageData.page = note;
                pageData.display = this.GDNTStoragePageDefaultDisplay;
                const notesData = this.getPageNotes(session, note);
                const filterPages = notesData.linkedPages.filter(obj => obj.page == page);
                if (filterPages.length == 0) {
                    notesData.linkedPages.push({page: page, display: cleanTitle(document.title)});
                }

                const notesPageList = this.getPageNotes(session, '');
                const filterNotes = notesPageList.linkedPages.filter(obj => obj.page == note);
                if (filterNotes.length == 0) {
                    notesPageList.linkedPages.push({page: note, display: this.GDNTStorageNoteDefaultDisplay});
                }
            }
            else {
                delete session[page];
            }
        },
        // public
        // Uses session
        fixSavedData: function(note, title) {
            this.sessionStart((session) => {
                const notesPageList = this.getPageNotes(session, '');
                const filter = notesPageList.linkedPages.filter(obj => obj.page == note);
                if (filter.length == 0) {
                    return {save: false, result: null};
                }
                const notesPage = this.getPageNotes(session, note);
                if (notesPage.display != this.GDNTStorageNoteDefaultDisplay) {
                    return {save: false, result: null};
                }
                notesPage.display = title;
                filter[0].display = title;
                return true;
            });
        },
        // Public
        // Uses session
        setPageNotes: function(page, notes) {
            this.sessionStart((session) => {
                this.setPageNotesData(session, page, notes);
                return true;
            });
        },
        // Public
        // Uses session
        notesPageLink: function(page) {
            return this.sessionStart((session) => {
                const pageData = this.getPageNotes(session, page);
                return [false, pageData.page];
            });
        },
        // Public
        // Uses session
        delNote: function(note) {
            this.sessionStart((session) => {
                const noteList = this.getPageNotes(session, '');
                noteList.linkedPages = noteList.linkedPages.filter(obj => obj.page != note);

                const noteData = this.getPageNotes(session, note);
                for (const page of noteData.linkedPages) {
                    this.setPageNotesData(session, page.page, null);
                }

                delete session[note];
                return true;
            });
        },
        // Public
        // Needs session
        getListAllNotes: function(session) {
            return this.getPageNotes(session, '').linkedPages;
        },
        // Public
        // Needs session
        getNoteData: function(session, page) {
            const pageData = this.getPageNotes(session, page);
            return pageData.page == '' ? {page:'', display:'', linkedPages:[]} : this.getPageNotes(session, pageData.page);
        },
        // Public
        // Needs session
        getPageData: function(session, page) {
            return this.getPageNotes(session, page);
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
            const session = this.getGDNTData();
            const result = action(session);
            if (result === undefined || result === null || result === false) {
                return;
            }
            if (result === true) {
                this.setGDNTData(session)
                return;
            }
            if (result.constructor === Array) {
                if (result.length > 0 && result[0] === true) {
                    this.setGDNTData(session);
                }
                if (result.length > 1) {
                    return result[1];
                }
            }
            return;
        },
    };
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
            window.open(Storage.notesPageLink(currentPage), '_blank');
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
                const pageData = Storage.getPageData(session, page);
                const noteData = Storage.getNoteData(session, page);
                const notesList = Storage.getListAllNotes(session);
                return [false, {pageData: pageData, noteData: noteData, notesList: notesList}];
            });

            const hasNote = storageData.pageData.page != '';
            console.log(`
                pageData:            ${JSON.stringify(storageData.pageData)}
                pageData.isNote:     ${storageData.pageData.linkedPages.length ? true : false}
                pagesOnNoteList:     ${storageData.noteData.linkedPages.length}
                notesList:           ${storageData.notesList.length}
                pageData.linkedPages:${storageData.pageData.linkedPages.length}
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
                <div class="GDNTContainer"  style="display:${storageData.pageData.linkedPages.length ? 'block' : 'none'}">
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
                list1 += `<li><img class="DeleteNote" value="${linkPage.page}" src="${deleteIcon}"/><a class="NotesPage" value="${linkPage.page}">${linkPage.display}</a></li>`;
            }
            var list2 = '';
            for (const linkPage of storageData.pageData.linkedPages) {
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


