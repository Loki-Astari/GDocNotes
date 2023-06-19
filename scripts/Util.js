// A filter wrapper for an iterator.
class Util
{
    // Removes the Query and fragment from a URL
    // Note: There are a lot of invalid URL in real life that don't use the '?'
    //       So must compensate for that.
    static cleanUrl(url) {
        return url.split('?')[0].split('&')[0].split('#')[0];
    }
    // Takes the HTML title from a document.
    // Google adds the " - Google docs" to this title. We
    // don't want to display that so just remove it.
    static cleanTitle(title) {
        return title.split(' - Google Docs')[0];
    }
    // Takes an iterator and a predicate.
    // Returns an iterator that filters the original iterator by the predicate.
    // So you don't need to build an array and then filter that, it is lazily evaluated.
    static filter(iterable, predicate) {
        let iterator = iterable[Symbol.iterator]();
        return { // This object is both iterator and iterable
            [Symbol.iterator]() {
                return this;
            },
            next() {
                for(;;) {
                    let v = iterator.next();
                    if(v.done || predicate(v.value)) {
                        return v;
                    }
                }
            }
        };
    }
}

// Used by the test harness.
if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = Util;
}
