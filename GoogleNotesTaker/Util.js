const cleanUrl = function(url) {
    return url.split('?')[0].split('#')[0];
}
const cleanTitle = function(title) {
    return title.split(' - Google Docs')[0];
}

