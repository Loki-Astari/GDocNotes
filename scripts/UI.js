class UI {

    // Init and refresh the UI.
    #storage;
    #uiBuilder;
    #currentPage;
    #mouseOverDeletable;
    #pageDirty;

    #addNotes(note) {
        // Can't set a page to be its own Note.
        if (note == this.#currentPage) {
            return null;
        }
        this.#storage.sessionStart((session) => {
            session.setNote(this.#currentPage, note);
            return true;
        });
        this.addUI();
    }

    // Private
    addLabel(label) {
        this.#storage.sessionStart((session) => {
            session.addLabel(this.#currentPage, label);
            return true;
        });
        this.addUI();
    }

    // Event Handler
    delPageNoteClick(event, page) {
        const over = this.#mouseOverDeletable;
        const dirty = this.#storage.sessionStart((session) => {
            var dirty = false;
            if (over.classList.contains('gdnt-note-page')) {
                session.setNote(page, '');
                dirty = true;
            }
            else if (over.classList.contains('gdnt-label-page')) {
                const split = page.split(/:(https.*)/s);
                const realPage = split[1];
                const label = split[0];
                session.remLabel(realPage, label);
                dirty = true;
            }
            else if (over.classList.contains('gdnt-note')) {
                const confirmDelete = confirm(`
Deleting     a Note will delete all linking pages from the internal DB.
Are you     sure?`);
                if (confirmDelete) {
                    session.deleteNote(page);
                    dirty = true;
                }
            }
            else if (over.classList.contains('gdnt-label')) {
                const confirmDelete = confirm(`
Deleting     a Label will delete all linking pages from the internal DB.
Are you     sure?`);
                if (confirmDelete) {
                    session.deleteLabel(page);
                    dirty = true;
                }
            }
            // The first element decides if changes should be saved.
            // So only save if it is dirty.
            // The second element is returned as the result of sessionStart
            // So we can use it below to re-build the UI.
            return [dirty, dirty];
        });

        if (dirty) {
            this.addUI();
        }
    }

    // Event Handler
    addNotesClick(event, page) {
        this.#addNotes(prompt('URL of NotePage: ', page));
    }

    // Event Handler
    addLabelClick(event) {
        this.addLabel(prompt('Label: ', ''));
    }

    // Event Handler
    addNotesClickPageClick(event, note) {
        this.#addNotes(note);
    }

    // Event Handler
    addLabelClickPageClick(event, label) {
        this.addLabel(label);
    }

    getOrCreateRoot() {

        const findBlock = document.getElementById('GDNTNotesContainer');
        // If we have already created this element then re-use the existing one.
        if (findBlock) {
            return findBlock;
        }

        // Otherwise create the root element
        // And carefullt put it in the DOM.
        const block = document.createElement('div');
        block.setAttribute ('id', 'GDNTNotesContainer');
        block.style.padding = '0 0 30px 0';

        // Note: buildUI() is only called after these elements
        //       have been created. So we don't need to check for existance.
        //       See: WaitForKeyElement
        const left = document.getElementsByClassName('left-sidebar-container')[0];
        const parent = left.getElementsByClassName('navigation-widget-content')[0];
        const child = parent.getElementsByClassName('navigation-widget-smart-summary-container')[0];

        parent.insertBefore(block, child);
        return block;
    }

    deleteableEnter(event) {
        const isDeleteButton = event.target.classList.contains('gdnt-deletable-nofocus');
        if (isDeleteButton) {
            // The delete button is only visible (enterable) if the mouse was over a deletable.
            // Moving over the delete button does not change any state.
            return;
        }

        // Make sure we always point mouseOverDeletable at the outer of the two sectiots of the deleteable.
        // See: uiBuilder.buildListElements()
        const newOver = (event.target.classList.contains('gdnt-deletable-inner')) ? event.target.parentNode : event.target;
        if (this.#mouseOverDeletable != newOver) {
            this.#mouseOverDeletable = newOver;
            this.#mouseOverDeletable.classList.add('goog-button-hover');
            this.#mouseOverDeletable.style.paddingRight = '37px';
            this.#mouseOverDeletable.children[0].setAttribute('data-tooltip-offset', '-37');
        }

        // Make sure the delete button is visable and scrolled to the correct location.
        //const top = this.#mouseOverDeletable.getBoundingClientRect().top + window.scrollY - 47 - document.getElementById('kix-horizontal-ruler-container').offsetHeight - document.getElementById('docs-chrome').offsetHeight + document.getElementsByClassName('navigation-widget-content')[0].scrollTop;
        const top = this.#mouseOverDeletable.getBoundingClientRect().top + window.scrollY - document.getElementsByClassName('left-sidebar-container-content')[0].getBoundingClientRect().top - 49 + document.getElementsByClassName('navigation-widget-content')[0].scrollTop;
        const cross = document.getElementById('gdnt-delete-item');
        cross.style.top = `${top}px`;
        cross.style.display = 'block';
        const removeToolTip = this.#mouseOverDeletable.getAttribute('data-deletable-tt');
        const name = this.#mouseOverDeletable.children[0].getAttribute('data-tooltip');
        cross.setAttribute('data-tooltip', removeToolTip);
        cross.children[0].setAttribute('data-tooltip', removeToolTip);
    }

    deletableLeave(event) {
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
            // we pick the outer of the two sections to a deletable object (see uiBuilder.buildListelements)
            // If this is not the deletable we were previuously over then we need to reset the previous element
            // to its original state.
            const newOver = (event.relatedTarget.classList.contains('gdnt-deletable-inner')) ? event.relatedTarget.parentNode : event.relatedTarget;
            if (newOver != this.#mouseOverDeletable) {
                resetCurrentMouseOver = true;
            }
        }
        else {
            // If we are leaving the deletable that is currently active
            // Note: we have taken care of moving to over the delete button.
            // Then we need to reset the state of the deletable.
            if (event.target == this.#mouseOverDeletable) {
                resetCurrentMouseOver = true;
            }
        }

        if (resetCurrentMouseOver && this.#mouseOverDeletable) {
            this.#mouseOverDeletable.classList.remove('goog-button-hover');
            this.#mouseOverDeletable.style.paddingRight = '8px';
            this.#mouseOverDeletable.children[0].setAttribute('data-tooltip-offset', '-8');
            this.#mouseOverDeletable = null;
        }

        // Hide the delete button only if
        // the mouse moves away from a deletable objet.
        if (!event.relatedTarget.classList.contains('gdnt-deletable')) {
            document.getElementById('gdnt-delete-item').style.display = 'none';
        }
    }

    addUI() {
        const storageData = this.#storage.sessionStart((session) => {
            return [false, session];
        });

        console.log(JSON.stringify(storageData, null, 4));

        const block = this.getOrCreateRoot();
        block.innerHTML = this.#uiBuilder.build(storageData, this.#currentPage);

        const page = storageData.getPage(this.#currentPage);
        const hasNote = page.noteUrl != '';

        document.getElementById('gdnt-notes-edit').style.display = hasNote ? 'block' : 'none';
        document.getElementById('gdnt-notes-add').style.display = hasNote ? 'none' : 'block';
        document.getElementById('gdnt-notes-list-of-notes').style.display = hasNote ? 'none' : 'block';
        document.getElementById('gdnt-notes-edit').addEventListener('click', (event) => {this.addNotesClick(event, page.noteUrl);});
        document.getElementById('gdnt-notes-add').addEventListener('click', (event) => {this.addNotesClick(event, 'https://docs.google.com/document/d/');});
        document.getElementById('gdnt-labels-add').addEventListener('click', (event) => {this.addLabelClick(event);});
        document.getElementById('gdnt-delete-item').addEventListener('click', (event) => {this.delPageNoteClick(event, this.#mouseOverDeletable.getAttribute('value'));});
        for (const link of document.getElementsByClassName('gdnt-deletable')) {
            link.addEventListener('mouseenter', (event) => {this.deleteableEnter(event)});
            link.addEventListener('mouseleave', (event) => {this.deletableLeave(event)});
        }
        for (const link of document.getElementsByClassName('gdnt-label')) {
            link.addEventListener('mouseenter', (event) => {event.target.children[0].style.color = 'green';});
            link.addEventListener('mouseleave', (event) => {event.target.children[0].style.color = '#444746';});
            link.addEventListener('click', (event) => {this.addLabelClickPageClick(event, link.getAttribute('value'));});
        }
        for (const link of document.getElementsByClassName('gdnt-note')) {
            link.addEventListener('mouseenter', (event) => {event.target.children[0].style.color = 'green';});
            link.addEventListener('mouseleave', (event) => {event.target.children[0].style.color = '#444746';});
            link.addEventListener('click', (event) => {this.addNotesClickPageClick(event, link.getAttribute('value'));});
        }
    }

    createUI() {
        this.addUI();
        window.addEventListener('storage', (event) => {
            if (event.key == this.#storage.GDNTStorageName) {
                if (document.visibilityState != 'visible') {
                    this.#pageDirty = true;
                }
                else {
                    // Don't update if I was the page that did the change.
                    this.addUI();
                }
            }
        });
        document.addEventListener('visibilitychange', (event) => {
            if (document.visibilityState == 'visible') {
                if (this.#pageDirty) {
                    this.addUI();
                }
            }
        });
    }

    constructor(storage, uiBuilder, page) {
        this.#storage = storage;
        this.#uiBuilder = uiBuilder;
        this.#currentPage = page;
        this.#mouseOverDeletable = null;
        this.#pageDirty = false;
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = UI;
}


