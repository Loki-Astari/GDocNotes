class PageInfo {
    #url;
    #display;
    #noteUrl;
    #labels;
    #linkedPages;

    get url()           {return this.#url;}
    get display()       {return this.#display;}
    get noteUrl()       {return this.#noteUrl;}
    get labels()        {return this.#labels.values();}
    get linkedPages()   {return this.#linkedPages.values();}

    constructor(value) {
        if (typeof value === 'string') {
            this.#url           = value;
            this.#display       = '';
            this.#noteUrl       = '';
            this.#labels        = [];
            this.#linkedPages   = [];
        }
        else {
            this.#url           = value.url         || '';
            this.#display       = value.display     || '';
            this.#noteUrl       = value.noteUrl     || '';
            this.#labels        = value.labels      || [];
            this.#linkedPages   = value.linkedPages || [];
        }
    }
    toJSON() {
        return {url:this.#url, display:this.#display, noteUrl:this.#noteUrl, labels:this.#labels, linkedPages:this.#linkedPages};
    }
    static duplicateWithReplace(page, replace) {
        return new PageInfo({   url:           undefined !== replace.url         ? replace.url          : page.url,
                                display:       undefined !== replace.display     ? replace.display      : page.display,
                                noteUrl:       undefined !== replace.noteUrl     ? replace.noteUrl      : page.noteUrl,
                                labels:        undefined !== replace.labels      ? replace.labels       : Array.from(page.labels),
                                linkedPages:   undefined !== replace.linkedPages ? replace.linkedPages  : Array.from(page.linkedPages)
                            });
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = PageInfo;
}
