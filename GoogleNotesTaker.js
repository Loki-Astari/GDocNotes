// ==UserScript==
// @name         Google Docs Note Taker
// @namespace    http://LokiAstari.com/
// @version      0.14
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
                console.log('Delete Note >' + note + '<');
                const noteData = session.getNotesInfo(note);
                for (const page of noteData.linkedPages) {
                    console.log('Delete Page: >' + page.page + '<');
                    session.delPageNote(page.page);
                }

                session.delNoteInfo(note);
                console.log('Session: ' + JSON.stringify(session));
                return true;
            });
        },
    };

    const UIBuilder = {
        buildListElementAnchor: function(cl, linkPage, link) {
            if (cl == 'gdnt-note') {
                return linkPage.display;
            }
            return `<a class="gdnt-anchor" href="${link}">${linkPage.display}</a>`
        },
        buildListElement: function(list, cl, actiontt, deletett, extraStyle) {
            var output = '';
            for (const linkPage of list) {
               //<div class="navigation-item location-indicator-highlight" role="menuitem" id="a4jzle:170" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-title navigation-item-level-0" data-tooltip="Enhanced Attributes Storage/Access Design Review" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Enhanced Attributes Storage/Access Design Review</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:171" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-1" data-tooltip="Item1" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 1</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:172" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-1" data-tooltip="Item2" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 2</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:173" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-title navigation-item-level-0" data-tooltip="Item3" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 3</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:174" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-1" data-tooltip="Item4" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 4</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:175" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-2" data-tooltip="Item5" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 5</div></div>
                const link = linkPage.page || linkPage.note;
                console.log("Link: " + link);
                output += `
<div class="gdnt-deletable navigation-item ${cl}" role="menuitem" style="user-select: none;" data-deletable-tt="${deletett}" value="${link}" padding-right: 8px; margin-bottom: 0px;">
    <div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" ${extraStyle} data-tooltip="${actiontt}${linkPage.display}" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">${this.buildListElementAnchor(cl, linkPage, link)}</div>
</div>`;
            }
            return output;
        },
        buildList: function(list, cl, actiontt, deletett, extraStyle) {
            return `
        <div class="updating-navigation-item-list">
            <div class="updating-navigation-item-list">
                <div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;">
                    ${this.buildListElement(list, cl, actiontt, deletett, extraStyle)}
                </div>
            </div>
        </div>`;
        },
        build: function(storageData)
        {
            return `
       <div class="updating-navigation-item-list">
           <div class="updating-navigation-item-list">
               <div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;">
                   <div id="gdnt-delete-item" class="gdnt-deletable gdnt-deletable-nofocus navigation-widget-row-controls" style="top: 145px; right: 23px; display: none;">
                       <div class="gdnt-deletable gdnt-deletable-nofocus navigation-widget-row-controls-control navigation-widget-row-controls-suppress goog-inline-block goog-flat-button" role="button" data-tooltip="Remove:" data-tooltip-offset="-8" id="a4jzle:16y" tabindex="0" style="user-select: none;">
                           <div class="gdnt-deletable gdnt-deletable-nofocus docs-icon goog-inline-block ">
                               <div class="gdnt-deletable gdnt-deletable-nofocus docs-icon-img-container docs-icon-img docs-icon-close-thin">
                                   &nbsp;
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       </div>
       <div class="navigation-widget-smart-summary-container-1">
            <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
                <div class="kix-smart-summary-view-header-container">
                    <div class="gdnt-notes-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-note="${storageData.noteData.note}" role="heading">
                        Notes: <div class="navigation-item-content" style="display:inline"><a class="gdnt-anchor" href="${storageData.noteData.note}">${storageData.noteData.display}</a></div>
                    </div>
                    <!-- Edit Note -->
                    <div id="gdnt-notes-edit" role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-edit-button" data-tooltip="Edit Notes" style="display: none;" data-ol-has-click-handler="">
                        <div class="docs-icon goog-inline-block ">
                            <div class="docs-icon-img-container docs-icon-img docs-icon-edit-outline">
                                &nbsp;
                            </div>
                        </div>
                    </div>
                    <!-- Add Note -->
                    <div id="gdnt-notes-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: none;">
                        <div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon" data-ol-has-click-handler="">
                            <div class="docs-icon goog-inline-block ">
                                <div class="docs-icon-img-container docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                        <div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Notes" data-ol-has-click-handler="">
                            <div class="docs-icon goog-inline-block ">
                                <div class="docs-icon-img-container docs-icon-img docs-icon-plus">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="gdnt-notes-list-of-notes" class="kix-smart-summary-view-content-container" style="display: none;">
                    <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0" role="heading">
                        Existing Notes Documents:
                    </div>
                    ${this.buildList(storageData.notesList, 'gdnt-note', 'Add this page to ', 'Note', 'style="padding-left: 0px;"')}
                <div class="kix-smart-summary-view-separator">
                </div>
            </div>
        </div>
        <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
            Pages Linked to this page:
        </div>
        ${this.buildList(storageData.pageNote.linkedPages, 'gdnt-note-page', 'Open ', 'Page', '')}

        <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
            Pages Linked to same note:
        </div>
        ${this.buildList(storageData.noteData.linkedPages, 'gdnt-note-page', 'Open ', 'Page', '')}
        <div class="outlines-widget">
        </div>`;
        }
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
            this.addUI();
        },
        // Event Handler
        delPageNoteClick: function(event, page) {
            var dirty = false;
            console.log("MO: " + JSON.stringify(this.mouseOverDeletable.classList, null, 4));
            if (this.mouseOverDeletable.classList.contains('gdnt-note-page')) {
                Storage.setPageNotes(page, '');
                dirty = true;
            }
            else if (this.mouseOverDeletable.classList.contains('gdnt-note')) {
                const confirmDelete = confirm(`
Deleting a Note will delete all linking pages from the internal DB.
Are you sure?`);
                if (confirmDelete) {
                    Storage.delNote(page);
                    dirty = true;
                }
            }

            if (dirty) {
                this.addUI();
            }
        },
        // Event Handler
        addNotesClick: function(event, page) {
            console.log("Page: " + page);
            this.addNotes(prompt('URL of NotePage: ', page));
        },
        // Event Handler
        addNotesClickPageClick: function(event, notes) {
            this.addNotes(notes);
        },
        // Event Handler
        refreshNotesClick: function(event) {
            this.addUI();
        },
        // Init and refresh the UI.
        currentPage: null,
        mouseOverDeletable: null,
        pageDirty: false,
        getOrCreateRoot: function() {

            const findBlock = document.getElementById('GDNTNotesContainer');
            // If we have already created this element then re-use the existing one.
            if (findBlock) {
                return findBlock;
            }

            // Otherwise create the root element
            // And carefullt put it in the DOM.
            const block = document.createElement('div');
            block.setAttribute ('id', 'GDNTNotesContainer');
            block.style.padding = '0 0 50px 0';

            // Note: buildUI() is only called after these elements
            //       have been created. So we don't need to check for existance.
            //       See: WaitForKeyElement
            const left = document.getElementsByClassName('left-sidebar-container')[0];
            const parent = left.getElementsByClassName('navigation-widget-content')[0];
            const child = parent.getElementsByClassName('navigation-widget-smart-summary-container')[0];

            parent.insertBefore(block, child);
            return block;
        },
        deleteableEnter: function(event) {
            const isDeleteButton = event.target.classList.contains('gdnt-deletable-nofocus');
            if (isDeleteButton) {
                //console.log('Enter: Delete Button');
                // The delete button is only visible (enterable) if the mouse was over a deletable.
                // Moving over the delete button does not change any state.
                return;
            }

            // Make sure we always point mouseOverDeletable at the outer of the two sectiots of the deleteable.
            // See: UIBuilder.buildListElements()
            const newOver = (event.target.classList.contains('gdnt-deletable-inner')) ? event.target.parentNode : event.target;
            if (this.mouseOverDeletable != newOver) {
                //console.log('Enter: New Over');
                this.mouseOverDeletable = newOver;
                this.mouseOverDeletable.classList.add('goog-button-hover');
                this.mouseOverDeletable.style.paddingRight = '37px';
                this.mouseOverDeletable.children[0].setAttribute('data-tooltip-offset', '-37');
            }

            // Make sure the delete button is visable and scrolled to the correct location.
            //const top = this.mouseOverDeletable.getBoundingClientRect().top + window.scrollY - 47 - document.getElementById('kix-horizontal-ruler-container').offsetHeight - document.getElementById('docs-chrome').offsetHeight + document.getElementsByClassName('navigation-widget-content')[0].scrollTop;
            const top = this.mouseOverDeletable.getBoundingClientRect().top + window.scrollY - document.getElementsByClassName('left-sidebar-container-content')[0].getBoundingClientRect().top - 49 + document.getElementsByClassName('navigation-widget-content')[0].scrollTop;
            const cross = document.getElementById('gdnt-delete-item');
            cross.style.top = `${top}px`;
            cross.style.display = 'block';
            const type = this.mouseOverDeletable.getAttribute('data-deletable-tt');
            const name = this.mouseOverDeletable.children[0].getAttribute('data-tooltip');
            console.log
            cross.setAttribute('data-tooltip', `Remove ${type}: ${name}`);
            cross.children[0].setAttribute('data-tooltip', `Remove ${type}: ${name}`);
        },
        deletableLeave: function(event) {
            //console.log('Leave:');
            var resetCurrentMouseOver = false;
            const isSrcDeleteButton = event.target.classList.contains('gdnt-deletable-nofocus');
            const isDestDeleteButton = event.relatedTarget.classList.contains('gdnt-deletable-nofocus');
            if (isSrcDeleteButton && isDestDeleteButton) {
                //console.log("  Leave Still in Delete");
                // Moving between the parts of the delete button does not change state.
            }
            else if (isDestDeleteButton) {
                //console.log('  Leave: Dst Delete');
                // If we are moving from a deletable to the delete button.
                // Then no action is required (Same as mouseEnter)
            }
            else if (isSrcDeleteButton) {
                //console.log('  Leave Src Delete');
                // We are leaving a delete button.
                // Get the element we are moving over. If this is a deletable make sure
                // we pick the outer of the two sections to a deletable object (see UIBuilder.buildListelements)
                // If this is not the deletable we were previuously over then we need to reset the previous element
                // to its original state.
                const newOver = (event.relatedTarget.classList.contains('gdnt-deletable-inner')) ? event.relatedTarget.parentNode : event.relatedTarget;
                if (newOver != this.mouseOverDeletable) {
                    //console.log('    Leave Src Delete Dst Not control');
                    resetCurrentMouseOver = true;
                }
            }
            else {
                //console.log('  Leave: Control');
                // If we are leaving the deletable that is currently active
                // Note: we have taken care of moving to over the delete button.
                // Then we need to reset the state of the deletable.
                if (event.target == this.mouseOverDeletable) {
                    //console.log('    Leave: Constrol Active');
                    resetCurrentMouseOver = true;
                }
            }

            if (resetCurrentMouseOver && this.mouseOverDeletable) {
                //console.log('  Leave Reset');
                this.mouseOverDeletable.classList.remove('goog-button-hover');
                this.mouseOverDeletable.style.paddingRight = '8px';
                this.mouseOverDeletable.children[0].setAttribute('data-tooltip-offset', '-8');
                this.mouseOverDeletable = null;
            }

            // Hide the delete button only if
            // the mouse moves away from a deletable objet.
            if (!event.relatedTarget.classList.contains('gdnt-deletable')) {
                document.getElementById('gdnt-delete-item').style.display = 'none';
                //console.log('->Leave Remove');
            }
        },
        addUI: function()
        {
            const storageData = Storage.sessionStart((session) => {
                const pageData = session.getPageData(this.currentPage);
                const pageNote = session.findNoteInfo(this.currentPage);
                const noteData = session.getNoteData(this.currentPage);
                const notesList = session.getListAllNotes();
                return [false, {hasNote: pageData.note != '', pageData: pageData, pageNote: pageNote, noteData: noteData, notesList: notesList}];
            });

            console.log(`
                pageData:            ${JSON.stringify(storageData.pageData)}
                pageNote.isNote:     ${storageData.pageNote.linkedPages.length ? true : false}
                pagesOnNoteList:     ${storageData.noteData.linkedPages.length}
                notesList:           ${storageData.notesList.length}
                pageNote.linkedPages:${storageData.pageNote.linkedPages.length}
                noteData.likkedPages:${storageData.noteData.linkedPages.length}
                hasNote:             ${storageData.hasNote}
            `);

            const block = this.getOrCreateRoot();

            block.innerHTML = UIBuilder.build(storageData);

            document.getElementById('gdnt-notes-edit').style.display = storageData.hasNote ? 'block' : 'none';
            document.getElementById('gdnt-notes-add').style.display = storageData.hasNote ? 'none' : 'block';
            document.getElementById('gdnt-notes-list-of-notes').style.display = storageData.hasNote ? 'none' : 'block';
            console.log(JSON.stringify(storageData, null, 4));
            document.getElementById('gdnt-notes-edit').addEventListener('click', (event) => {UI.addNotesClick(event, storageData.noteData.note);});
            document.getElementById('gdnt-notes-add').addEventListener('click', (event) => {UI.addNotesClick(event, 'https://docs.google.com/document/d/');});
            document.getElementById('gdnt-delete-item').addEventListener('click', (event) => {UI.delPageNoteClick(event, this.mouseOverDeletable.getAttribute('value'));});
            for (const link of document.getElementsByClassName('gdnt-deletable')) {
                link.addEventListener('mouseenter', (event) => {this.deleteableEnter(event)});
                link.addEventListener('mouseleave', (event) => {this.deletableLeave(event)});
            }
            for (const link of document.getElementsByClassName('gdnt-note')) {
                link.addEventListener('mouseenter', (event) => {event.target.children[0].style.color = 'green';});
                link.addEventListener('mouseleave', (event) => {event.target.children[0].style.color = '#444746';});
                link.addEventListener('click', (event) => {UI.addNotesClickPageClick(event, link.getAttribute('value'));});
            }
/*
            // Note: This function is called after these elements are loaded (see waitForKeyElements below)
            document.getElementById('GDNTNotesRefrButton').addEventListener('click', (event) => {UI.refreshNotesClick(event);});
*/
        },
        createUI: function(page) {
            this.currentPage = page;
            this.addUI();
            window.addEventListener("storage", (event) => {
                if (event.key == Storage.GDNTStorageName) {
                    if (document.visibilityState != "visible") {
                        UI.pageDirty = true;
                    }
                    else {
                        UI.addUI();
                    }
                }
            });
            document.addEventListener("visibilitychange", (event) => {
                if (document.visibilityState == "visible") {
                    console.log("tab is active");
                    if (UI.pageDirty) {
                        UI.addUI();
                    }
                }
            });
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
    GM_addStyle ( `
        div.gdnt-note {
            color: green;
        }
        a.gdnt-anchor {
            color: inherit;
            text-decoration: none;
        }

        a.gdnt-anchor:hover {
            color:#0B57D0;
            text-decoration:none;
            cursor:pointer;
        }
    `);

    waitForKeyElements('div.left-sidebar-container div.navigation-widget-smart-summary-container', () => {UI.createUI(currentPage);});
})();

