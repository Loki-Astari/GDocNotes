
class Util
{
    static cleanUrl(url) {
        return url.split('?')[0].split('&')[0].split('#')[0];
    }
    static cleanTitle(title) {
        return title.split(' - Google Docs')[0];
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = Util;
}

