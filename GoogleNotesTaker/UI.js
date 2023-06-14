
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
function GoogleDocsNoteTaker() {
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
            this.labels = storeObject.labels;
        };
        // Public
        static GDNTStorageNoteDefaultDisplay = '* Note Waiting For Title *';

        // Public
        getPageInfo(page) {
            if (!this.pages.hasOwnProperty(page)) {
                // This is the main object that can be interacted with externally.
                // The other interface usually return this.
                this.pages[page] = {note: '', labels: []};
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
        getLabelInfo(label) {
            var find = this.labels.filter(obj => obj.label == label);
            if (find.length == 0) {
                // This is the main object that can be interacted with externally.
                // The other interface usually return this.
                this.labels.push({label: label, linkedPages: []});
                find = this.labels.filter(obj => obj.label == label);
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
        findLabelInfo(label) {
            var find = this.labels.filter(obj => obj.label == label);
            return find.length == 0 ? {label: '', linkedPages: []} : find[0];
        };

        // Public
        delLabelInfo(label) {
            this.labels = this.labels.filter(obj => obj.label != label);
        };

        // Public
        setPageNotesData(page, note) {
            const pageData = this.getPageInfo(page);
            if (pageData.note) {
                const notesData = this.getNotesInfo(pageData.note);
                notesData.linkedPages = notesData.linkedPages.filter(obj => obj.page != page);
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
        setPageLabelsData(page, labels) {
            const pageData = this.getPageInfo(page);
            for (const label of pageData.labels) {
                if (labels.includes(label)) {
                    // Do nothing. Page already has this label.
                }
                else {
                    const labelData = this.getLabelInfo(label);
                    labelData.linkedPages = labelData.linkedPages.filter(obj => obj.page != page);
                }
            }
            for (const label of labels) {
                if (pageData.labels.includes(label)) {
                    // Do nothing. The new version of Labels still contains the label.
                }
                else {
                    const labelData = this.getLabelInfo(label);
                    labelData.linkedPages.push({page: page, display: cleanTitle(document.title)});
                }
            }
            pageData.labels = labels;
         };
        // Public
        getPageNoteInfo(page) {
            const pageData = this.getPageInfo(page);
            return pageData.note == '' ? {display:'', linkedPages:[]} : this.getNotesInfo(pageData.note);
        };
        // Public
        getPageLabelInfo(page) {
            const pageData = this.getPageInfo(page);
            return pageData.labels;
        };
        // Public
        getPageData(page) {
            return this.getPageInfo(page);
        };
        // Public
        getListAllNotes() {
            return this.notes;
        };
        // Public
        getListAllLabels() {
            return this.labels;
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
            return JSON.parse(GDNTStorageText || '{"pages":{}, "notes":[], "labels":[]}');
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
                this.setGDNTData({pages: session.pages, notes: session.notes, labels: session.labels});
                return;
            }
            if (result.constructor === Array) {
                if (result.length > 0 && result[0] === true) {
                    this.setGDNTData({pages: session.pages, notes: session.notes, labels: session.labels});
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
        setPageLabels: function(page, label) {
            this.sessionStart((session) => {
                const currentLabels = session.getPageLabelInfo(page).map((x) => x);
                if (currentLabels.indexOf(label) == -1) {
                    currentLabels.push(label);
                }
                session.setPageLabelsData(page, currentLabels);
                return true;
            });
        },
        // Public
        // Uses session
        delNote: function(note) {
            this.sessionStart((session) => {
                const noteData = session.getNotesInfo(note);
                for (const page of noteData.linkedPages) {
                    session.setPageNotesData(page.page, '');
                }

                session.delNoteInfo(note);
                return true;
            });
        },
        // Public
        // Uses session
        delLabel: function(label) {
            this.sessionStart((session) => {
                const labelData = session.getLabelInfo(label);
                for (const page of labelData.linkedPages) {
                    const pageLabelData = session.getPageLabelInfo(page.page);
                    const newPageLabel = pageLabelData.filter(obj => obj != label);
                    session.setPageLabelsData(page.page, newPageLabel);
                }

                session.delLabelInfo(label);
                return true;
            });
        },
    };

    const UIBuilder = {
        buildLabelList: function(labelData) {
            var output = '';
            for (const label of labelData) {
                output += `<span>${label} </span>`;

            }
            return output;
        },
        buildListElement: function(list, cl, actiontt, deletett, extraStyle, anchor, linker) {
            var output = '';
            for (const linkPage of list) {
               //<div class="navigation-item location-indicator-highlight" role="menuitem" id="a4jzle:170" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-title navigation-item-level-0" data-tooltip="Enhanced Attributes Storage/Access Design Review" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Enhanced Attributes Storage/Access Design Review</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:171" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-1" data-tooltip="Item1" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 1</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:172" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-1" data-tooltip="Item2" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 2</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:173" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-title navigation-item-level-0" data-tooltip="Item3" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 3</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:174" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-1" data-tooltip="Item4" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 4</div></div>
               //<div class="navigation-item" role="menuitem" id="a4jzle:175" style="user-select: none; padding-right: 8px;"><div class="navigation-item-content navigation-item-level-2" data-tooltip="Item5" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Item 5</div></div>
                //const link = linkPage.page || linkPage.note || linkPage.label;
                output += `
<div class="gdnt-deletable last_child_override navigation-item ${cl}" role="menuitem" style="user-select: none;" data-deletable-tt="${deletett(linkPage)}" value="${linker(linkPage)}" style="padding-right: 8px; margin-bottom: 0px;">
    <div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" ${extraStyle} data-tooltip="${actiontt(linkPage)}" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">${anchor(linkPage)}</div>
</div>`;
            }
            return output;
        },
        buildLabels: function(storageData) {
            var output = '';
            for (const label of storageData.labelData) {
                const labelInfo = storageData.labelsList.find(obj => obj.label == label);
                if (labelInfo) {
                output += `
        <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
            Pages Labeled: ${label}
        </div>
        ${this.buildList(labelInfo.linkedPages, 'gdnt-label-page', (linkPage)=>`Open: ${linkPage.display}`, (linkPage)=>`Remove '${label}' from Page: ${linkPage.display}`, '', (linkPage)=>`<a class="gdnt-anchor" href="${linkPage.page}">${linkPage.display}</a>`, (linkPage)=>`${label}:${linkPage.page}`)}
        `;
                }
            }
            return output;
        },
        buildList: function(list, cl, actiontt, deletett, extraStyle, anchor, linker) {
            return `
        <div class="updating-navigation-item-list">
            <div class="updating-navigation-item-list">
                <div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;">
                    ${this.buildListElement(list, cl, actiontt, deletett, extraStyle, anchor, linker)}
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
                   <!-- Remove Button: This is dynamically moved as mouse is moved over deletable items -->
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
                        <div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon" style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Notes" data-ol-has-click-handler="">
                            <div class="docs-icon goog-inline-block ">
                                <div class="docs-icon-img-container docs-icon-img docs-icon-plus">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
                <div class="kix-smart-summary-view-header-container">
                    <div class="gdnt-labels-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-labels="${storageData.noteData.note}" role="heading">
                        Labels: <div class="navigation-item-content" style="display:inline">${this.buildLabelList(storageData.labelData)}</div>
                    </div>
                    <!-- Add Label -->
                    <div id="gdnt-labels-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: block;">
                        <div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon" data-ol-has-click-handler="">
                            <div class="docs-icon goog-inline-block ">
                                <div class="docs-icon-img-container docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                        <div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon" style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Labels" data-ol-has-click-handler="">
                            <div class="docs-icon goog-inline-block ">
                                <div class="docs-icon-img-container docs-icon-img docs-icon-plus">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
             <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
                 <div id="gdnt-notes-list-of-notes" class="kix-smart-summary-view-content-container" style="display: none;">
                    <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">
                        Existing Notes Documents:
                    </div>
                    ${this.buildList(storageData.notesList, 'gdnt-note', (linkPage)=>`Add this page to Note '${linkPage.display}'`, (linkPage)=>`Delete Note: '${linkPage.display}'`, 'style="padding-left: 0px;"', (linkPage, link)=>linkPage.display, (linkPage)=>linkPage.note)}
                    <!-- <div class="kix-smart-summary-view-separator">
                    </div> -->
                </div>
                <div id="gdnt-labels-list-of-labels" class="kix-smart-summary-view-content-container" style="display: block;">
                    <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">
                        Existing Labels :
                    </div>
                    ${this.buildList(storageData.labelsList, 'gdnt-label', (linkPage)=>`Add label ${linkPage.label} to this page`, (linkPage)=>`Delete Label: ${linkPage.label}`, 'style="padding-left: 0px;"', (linkPage)=>linkPage.label, (linkPage)=>linkPage.label)}
                    <div class="kix-smart-summary-view-separator">
                    </div>
                </div>
            </div>
           <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
                Pages Linked to this page:
            </div>
            ${this.buildList(storageData.pageNote.linkedPages, 'gdnt-note-page', (linkPage)=>`Open: ${linkPage.display}`, (linkPage)=>`Remove Page: ${linkPage.display}`, '', (linkPage)=>`<a class="gdnt-anchor" href="${linkPage.page}">${linkPage.display}</a>`, (linkPage)=>linkPage.page)}

            <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
                Pages Linked to same note:
            </div>
            ${this.buildList(storageData.noteData.linkedPages, 'gdnt-note-page', (linkPage)=>`Open: ${linkPage.display}`, (linkPage)=>`Remove Page: ${linkPage.display}`, '', (linkPage)=>`<a class="gdnt-anchor" href="${linkPage.page}">${linkPage.display}</a>`, (linkPage)=>linkPage.page)}
            ${this.buildLabels(storageData)}
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
        addNotes: function(notes) {
            this.saveNotePage(cleanUrl(notes));
            this.addUI();
        },
        // Private
        addLabel: function(label) {
            if (label == '') {
                return;
            }
            Storage.setPageLabels(currentPage, label);
        },

        // Event Handler
        delPageNoteClick: function(event, page) {
            var dirty = false;
            if (this.mouseOverDeletable.classList.contains('gdnt-note-page')) {
                Storage.setPageNotes(page, '');
                dirty = true;
            }
            else if (this.mouseOverDeletable.classList.contains('gdnt-label-page')) {
                Storage.sessionStart((session) => {
                    const split = page.split(/:(https.*)/s);
                    const realPage = split[1];
                    const label = split[0];
                    const pageLabelData = session.getPageLabelInfo(realPage);
                    const newPageLabel = pageLabelData.filter(obj => obj != label);
                    session.setPageLabelsData(realPage, newPageLabel);
                    return true;
                });
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
            else if (this.mouseOverDeletable.classList.contains('gdnt-label')) {
                const confirmDelete = confirm(`
Deleting a Label will delete all linking pages from the internal DB.
Are you sure?`);
                if (confirmDelete) {
                    Storage.delLabel(page);
                    dirty = true;
                }
            }

            if (dirty) {
                this.addUI();
            }
        },
        // Event Handler
        addNotesClick: function(event, page) {
            this.addNotes(prompt('URL of NotePage: ', page));
        },
        // Event Handler
        addLabelClick: function(event) {
            this.addLabel(prompt('Label: ', ''));
        },
        // Event Handler
        addNotesClickPageClick: function(event, notes) {
            this.addNotes(notes);
        },
        // Event Handler
        addLabelClickPageClick: function(event, label) {
            this.addLabel(label);
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
                // The delete button is only visible (enterable) if the mouse was over a deletable.
                // Moving over the delete button does not change any state.
                return;
            }

            // Make sure we always point mouseOverDeletable at the outer of the two sectiots of the deleteable.
            // See: UIBuilder.buildListElements()
            const newOver = (event.target.classList.contains('gdnt-deletable-inner')) ? event.target.parentNode : event.target;
            if (this.mouseOverDeletable != newOver) {
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
            const removeToolTip = this.mouseOverDeletable.getAttribute('data-deletable-tt');
            const name = this.mouseOverDeletable.children[0].getAttribute('data-tooltip');
            cross.setAttribute('data-tooltip', removeToolTip);
            cross.children[0].setAttribute('data-tooltip', removeToolTip);
        },
        deletableLeave: function(event) {
            var resetCurrentMouseOver = false;
            const isSrcDeleteButton = event.target.classList.contains('gdnt-deletable-nofocus');
            const isDestDeleteButton = event.relatedTarget.classList.contains('gdnt-deletable-nofocus');
            if (isSrcDeleteButton && isDestDeleteButton) {
                // Moving between the parts of the delete button does not change state.
            }
            else if (isDestDeleteButton) {
                // If we are moving from a deletable to the delete button.
                // Then no action is required (Same as mouseEnter)
            }
            else if (isSrcDeleteButton) {
                // We are leaving a delete button.
                // Get the element we are moving over. If this is a deletable make sure
                // we pick the outer of the two sections to a deletable object (see UIBuilder.buildListelements)
                // If this is not the deletable we were previuously over then we need to reset the previous element
                // to its original state.
                const newOver = (event.relatedTarget.classList.contains('gdnt-deletable-inner')) ? event.relatedTarget.parentNode : event.relatedTarget;
                if (newOver != this.mouseOverDeletable) {
                    resetCurrentMouseOver = true;
                }
            }
            else {
                // If we are leaving the deletable that is currently active
                // Note: we have taken care of moving to over the delete button.
                // Then we need to reset the state of the deletable.
                if (event.target == this.mouseOverDeletable) {
                    resetCurrentMouseOver = true;
                }
            }

            if (resetCurrentMouseOver && this.mouseOverDeletable) {
                this.mouseOverDeletable.classList.remove('goog-button-hover');
                this.mouseOverDeletable.style.paddingRight = '8px';
                this.mouseOverDeletable.children[0].setAttribute('data-tooltip-offset', '-8');
                this.mouseOverDeletable = null;
            }

            // Hide the delete button only if
            // the mouse moves away from a deletable objet.
            if (!event.relatedTarget.classList.contains('gdnt-deletable')) {
                document.getElementById('gdnt-delete-item').style.display = 'none';
            }
        },
        addUI: function()
        {
            const storageData = Storage.sessionStart((session) => {
                const pageData = session.getPageData(this.currentPage);
                const pageNote = session.findNoteInfo(this.currentPage);
                const noteData = session.getPageNoteInfo(this.currentPage);
                const labelData = session.getPageLabelInfo(this.currentPage);
                const notesList = session.getListAllNotes();
                const labelsList = session.getListAllLabels();
                return [false, {hasNote: pageData.note != '', hasLabel: pageData.labels.length == 0, pageData: pageData, pageNote: pageNote, noteData: noteData, labelData: labelData, notesList: notesList, labelsList: labelsList}];
            });

            console.log(`
                pageData:            ${JSON.stringify(storageData.pageData)}
                pageNote.isNote:     ${storageData.pageNote.linkedPages.length ? true : false}
                pagesOnNoteList:     ${storageData.noteData.linkedPages.length}
                notesList:           ${storageData.notesList.length}
                labelsList:          ${storageData.labelsList.length}
                pageNote.linkedPages:${storageData.pageNote.linkedPages.length}
                noteData.likkedPages:${storageData.noteData.linkedPages.length}
                hasNote:             ${storageData.hasNote}
                hasLabel:            ${storageData.hasLabel}
            `);

            const block = this.getOrCreateRoot();
            block.innerHTML = UIBuilder.build(storageData);

            document.getElementById('gdnt-notes-edit').style.display = storageData.hasNote ? 'block' : 'none';
            document.getElementById('gdnt-notes-add').style.display = storageData.hasNote ? 'none' : 'block';
            document.getElementById('gdnt-notes-list-of-notes').style.display = storageData.hasNote ? 'none' : 'block';
            document.getElementById('gdnt-notes-edit').addEventListener('click', (event) => {UI.addNotesClick(event, storageData.noteData.note);});
            document.getElementById('gdnt-notes-add').addEventListener('click', (event) => {UI.addNotesClick(event, 'https://docs.google.com/document/d/');});
            document.getElementById('gdnt-labels-add').addEventListener('click', (event) => {UI.addLabelClick(event);});
            document.getElementById('gdnt-delete-item').addEventListener('click', (event) => {UI.delPageNoteClick(event, this.mouseOverDeletable.getAttribute('value'));});
            for (const link of document.getElementsByClassName('gdnt-deletable')) {
                link.addEventListener('mouseenter', (event) => {this.deleteableEnter(event)});
                link.addEventListener('mouseleave', (event) => {this.deletableLeave(event)});
            }
            for (const link of document.getElementsByClassName('gdnt-label')) {
                link.addEventListener('mouseenter', (event) => {event.target.children[0].style.color = 'green';});
                link.addEventListener('mouseleave', (event) => {event.target.children[0].style.color = '#444746';});
                link.addEventListener('click', (event) => {UI.addLabelClickPageClick(event, link.getAttribute('value'));});
            }
            for (const link of document.getElementsByClassName('gdnt-note')) {
                link.addEventListener('mouseenter', (event) => {event.target.children[0].style.color = 'green';});
                link.addEventListener('mouseleave', (event) => {event.target.children[0].style.color = '#444746';});
                link.addEventListener('click', (event) => {UI.addNotesClickPageClick(event, link.getAttribute('value'));});
            }
        },
        createUI: function(page) {
            this.currentPage = page;
            this.addUI();
            window.addEventListener('storage', (event) => {
                if (event.key == Storage.GDNTStorageName) {
                    if (document.visibilityState != 'visible') {
                        UI.pageDirty = true;
                    }
                    else {
                        UI.addUI();
                    }
                }
            });
            document.addEventListener('visibilitychange', (event) => {
                if (document.visibilityState == 'visible') {
                    if (UI.pageDirty) {
                        UI.addUI();
                    }
                }
            });
        }
    };
    const resetItem = false;
    if (resetItem) {
        localStorage.removeItem(Storage.GDNTStorageName, undefined);
    }
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
        .outline-refresh.navigation-widget .updating-navigation-item-list .navigation-item-list .last_child_override {
            margin-bottom: 0;
        }
    `);

    waitForKeyElements('div.left-sidebar-container div.navigation-widget-smart-summary-container', () => {UI.createUI(currentPage);});
}

