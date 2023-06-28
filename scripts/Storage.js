// The main access to the persisted state.
// Any user action should only call one method on "Storage"
// If you need to make multiple calls then sessionStart() see above
// You can perform multiple actions on the storage state before returning.
class Storage {

    #storageArea = null;

    #GDNTStorageName = 'GDNTPageData';

    // Private: Internally used by sessionStart
    #seaasionInUse = false;

    #getGDNTData() {
        const GDNTStorageText = this.#storageArea.getItem(this.#GDNTStorageName);
        return GDNTStorageText;
    }

    #setGDNTData(session) {
        this.#storageArea.setItem(this.#GDNTStorageName, JSON.stringify(session));
    }
    #parseJsonOrDefault(sessionText) {
        var inputObject;
        try {
            inputObject = JSON.parse(sessionText);
        }
        catch (e) {
            inputObject = {};
        }
        return inputObject;
    }


    constructor(storageArea = localStorage) {
        this.#storageArea =  storageArea;
        this.#seaasionInUse = false;
    }

    sessionStart(action) {
        if (this.#seaasionInUse) {
            // Should wait (otherwise we will loose data)
            // But very low chance of that happening as there is only one async call
            // See: UI.saveNotePage (Call to ajax has a callback function)
            // TODO:
        }
        this.#seaasionInUse = true;
        const sessionText = this.#getGDNTData() || '{"version":2,"pages":{},"labels":{},"notes":[]}';
        const inputObject = this.#parseJsonOrDefault(sessionText);
        const inputVersion = inputObject.version || 1;
        const session = new Data(inputObject);
        const result = action(session);
        if (result === undefined || result === null || result === false) {
            if (inputVersion != session.version) {
                this.#setGDNTData(session);
                return;
            }
        }
        else if (result === true) {
            this.#setGDNTData(session);
            return;
        }
        else if (result.constructor === Array) {
            if (result.length > 0 && result[0] === true) {
                this.#setGDNTData(session);
            }
            if (result.length > 1) {
                return result[1];
            }
        }
        return;
    }

}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = Storage;
}

