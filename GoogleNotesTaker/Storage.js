// The main access to the persisted state.
// Any user action should only call one method on "Storage"
// If you need to make multiple calls then sessionStart() see above
// You can perform multiple actions on the storage state before returning.
class Storage {

    // Private
    GDNTStorageName = 'GDNTPageData';

    // Private: Internally used by sessionStart
    seaasionInUse = false;

    // Private
    getGDNTData() {
        const GDNTStorageText = localStorage.getItem(this.GDNTStorageName);
        return JSON.parse(GDNTStorageText || '{"pages":{}, "notes":[], "labels":[]}');
    }

    // Private
    setGDNTData(newValue) {
        localStorage.setItem(this.GDNTStorageName, JSON.stringify(newValue));
    }

    // Public
    sessionStart(action) {
        if (this.seaasionInUse) {
            // Should wait (otherwise we will loose data)
            // But very low chance of that happening as there is only one async call
            // See: UI.saveNotePage (Call to ajax has a callback function)
            // TODO:
        }
        this.seaasionInUse = true;
        const sessionText = this.getGDNTData();
        console.log("Session: " + JSON.stringify(sessionText));
        const session = new StorageInterface(sessionText);
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
    }

    // public
    // Uses session
    fixSavedData(note, title) {
        this.sessionStart((session) => {
            const notesPage = session.getNotesInfo(note);
            if (notesPage.display != StorageInterface.GDNTStorageNoteDefaultDisplay) {
                return false;
            }
            notesPage.display = title;
            return true;
        });
    }

    // Public
    // Uses session
    setPageNotes(page, notes) {
        this.sessionStart((session) => {
            session.setPageNotesData(page, notes);
            return true;
        });
    }

    // Public
    // Uses session
    setPageLabels(page, label) {
        this.sessionStart((session) => {
            const currentLabels = session.getPageLabelInfo(page).map((x) => x);
            if (currentLabels.indexOf(label) == -1) {
                currentLabels.push(label);
            }
            session.setPageLabelsData(page, currentLabels);
            return true;
        });
    }

    // Public
    // Uses session
    delNote(note) {
        this.sessionStart((session) => {
            const noteData = session.getNotesInfo(note);
            for (const page of noteData.linkedPages) {
                session.setPageNotesData(page.page, '');
            }

            session.delNoteInfo(note);
            return true;
        });
    }

    // Public
    // Uses session
    delLabel(label) {
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
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = Storage;
}


