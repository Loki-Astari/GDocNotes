
class Converter {

    static #getOrInsertV2Page(v2, page) {
        var find = v2.pages[page];
        if (find == null) {
            find = {url: page, display: '', noteUrl: '', labels: [], linkedPages: []};
            v2.pages[page] = find;
        }
        return find;
    }

    static #covertVersion1(v1) {
        const v2 = {
            version:    2,
            pages:      {},
            labels:     {},
            notes:      [],
        }
        /*
         * v1 Page: { string: note, vector<string>: labels}
         *    pages: map<string, Page>
         */
        Object.keys(v1.pages).forEach((key, index) => {
            v2.pages[key] = {url: key, display: '', noteUrl: v1.pages[key].note, labels: v1.pages[key].labels, linkedPages: []};
        });

        /*
         * v1 Note:  { string: note, string: display, vector<{string: page, string: display}>: linkedPages}
         *    notes: vector<Note>
         */
        for (const note of v1.notes) {
            // Add all linked pages into v2.pages
            const v2Page = Converter.#getOrInsertV2Page(v2, note.note);
            v2Page.display = note.display;
            for (const noteLinkedPage of note.linkedPages) {
                v2Page.linkedPages.push(noteLinkedPage.page);
                const findLinked = Converter.#getOrInsertV2Page(v2, noteLinkedPage.page);
                findLinked.display = findLinked.display || noteLinkedPage.display;
            }

            /* Add V2 Note */
            v2.notes.push(note.note);
        }

        /*
         * v1 Label: { string: label, vector<{{string: page, string: display}>: linkedPages}
         *    labels:vector<Label>
         */
        for (const label of v1.labels) {
            // Add all labelled pages into v2.pages
            const linkedPages = [];
            for (const linkedPage of label.linkedPages) {
                linkedPages.push(linkedPage.page);
                const findLinked = Converter.#getOrInsertV2Page(v2, linkedPage.page);
                findLinked.display = findLinked.display || linkedPage.display;
            }

            /* Add V2 Label */
            v2.labels[label.label] = linkedPages;
        }
        return v2;
    }


    // Add any new converters here.
    static  #converters = [
        (obj)=>{return obj;},       // Version 0 does not exist.
        Converter.#covertVersion1,  // Version 1 to 2 converter.
    ];

    // Pass an object you want to convert.
    static convert(obj) {
        // V1 did not have a version tag.
        // Sloppy I know.
        // We have an explicit test below to make sure
        // you can not have a version without a tag now.
        var version = obj.version || 1;

        // Run through the converts converting from the current
        // version to the latest version.
        for (;version < Converter.#converters.length; ++version) {
            obj = Converter.#converters[version](obj);
        }

        // Make sure we have a version in the object.
        if (obj.version != Converter.#converters.length) {
            throw 'Invalid Conversion'
        }
        return obj;
    }

    // Current latest version we expect
    static expectedVersion()    {
        return Converter.#converters.length;
    }
}

// Used by the test harness.
if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = Converter;
}
