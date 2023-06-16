// A filter wrapper for an iterator.
class Util
{
    static cleanUrl(url) {
        return url.split('?')[0].split('&')[0].split('#')[0];
    }
    static cleanTitle(title) {
        return title.split(' - Google Docs')[0];
    }
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

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = Util;
}
