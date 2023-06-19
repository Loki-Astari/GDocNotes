class PageInfo {
    #url;
    #display;
    #noteUrl;
    #labels;
    #linkedPages;

    static #toArray(val) {
        const result = (val && typeof val[Symbol.iterator] === 'function') ? Array.from(val) : val;
        return result;
    }
    static #useReplacementIfDefined(value, replace) {
        return replace !== undefined ? replace : value;
    }

    get url()               {return this.#url;}
    get display()           {return this.#display;}
    get noteUrl()           {return this.#noteUrl;}
    get labels()            {return this.#labels.values();}
    get linkedPages()       {return this.#linkedPages.values();}
    get linkedPagesLength() {return this.#linkedPages.length;}

    // If there is no data stored in a page.
    // Then we can use this to filter it from the stored data.
    get empty() {
        return this.#linkedPages.length == 0 && this.#labels.length == 0 && this.#noteUrl == '';
    }
    toJSON() {
        return {url:this.#url, display:this.#display, noteUrl:this.#noteUrl, labels:this.#labels, linkedPages:this.#linkedPages};
    }

    constructor(url, display, noteUrl, labels, linkedPages) {
        if (!url) {
            throw 'Invalid Page Name';
        }
        if (!display) {

            // If no display value is provided then we should try and create a default value.

            // Lets try and get the title of the document
            // if the url is a valid url
            if (url.startsWith('https://')) {
                $.ajax({
                    method: 'HEAD',
                    url: url,
                    async: false,
                    success: function(pageHead) {
                        const title = Util.cleanTitle($(pageHead).filter('title').text());
                        if (title) {
                            display = title;
                        }
                    }
                });
            }
            // If we still have nothing then lets default to url
            display = display || url;
        }
        this.#url           = url;
        this.#display       = display;
        this.#noteUrl       = noteUrl       || '';
        this.#labels        = labels        || [];
        this.#linkedPages   = linkedPages   || [];
    }

    static buildPageInfoFromValue(url, display, noteUrl, labels, linkedPages) {
        labels        = PageInfo.#toArray(labels);
        linkedPages   = PageInfo.#toArray(linkedPages);
        return new PageInfo(url, display, noteUrl, labels, linkedPages);
    }
    static buildPageInfoFromObject(value) {
        const labels        = PageInfo.#toArray(value.labels);
        const linkedPages   = PageInfo.#toArray(value.linkedPages);
        return new PageInfo(value.url, value.display, value.noteUrl, labels, linkedPages);
    }
    static buildDuplicateWithReplace(page, replace) {
        return new PageInfo(PageInfo.#useReplacementIfDefined(page.url, replace.url),
                            PageInfo.#useReplacementIfDefined(page.display, replace.display),
                            PageInfo.#useReplacementIfDefined(page.noteUrl, replace.noteUrl),
                            PageInfo.#toArray(PageInfo.#useReplacementIfDefined(page.labels, replace.labels)),
                            PageInfo.#toArray(PageInfo.#useReplacementIfDefined(page.linkedPages, replace.linkedPages))
                           );
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = PageInfo;
}
