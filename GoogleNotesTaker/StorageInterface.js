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
