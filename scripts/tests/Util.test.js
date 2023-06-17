
beforeAll(async () => {
    process.env['NODE_DEV'] = 'TEST';
    global.Util = require('../Util.js');
});


// First Test to show tests are working.
test('Util: First Test', () => {
    expect(true).toBe(true);
});

const testData = {
    url: {
        standard:       'https://site.com/path1/path2',
        args:           'https://site.com/path1/path2?arg1=12&arg2=Stuff&arg3=true',
        invalidArgs:    'https://site.com/path1/path2&arg1=12&arg2=Stuff&arg3=true',
        fragment:       'https://site.com/path1/path2#1234',
        argsfragment:   'https://site.com/path1/path2?arg1=12&arg2=Stuff#1234',
        argsInvfragment:'https://site.com/path1/path2&arg1=12&arg2=Stuff#1234',
    },
    title: {
        simple:         'A normal Title',
        google:         'A normal Title - Google Docs',
    }
};

// Clean URL
test('Util: cleanUrl Normal', () => {

    expect(Util.cleanUrl(testData.url.standard)).toBe(testData.url.standard);
});
test('Util: cleanUrl Args', () => {

    expect(Util.cleanUrl(testData.url.args)).toBe(testData.url.standard);
});
test('Util: cleanUrl Invalid (but common) Args', () => {

    expect(Util.cleanUrl(testData.url.invalidArgs)).toBe(testData.url.standard);
});
test('Util: cleanUrl Fragment Only', () => {

    expect(Util.cleanUrl(testData.url.fragment)).toBe(testData.url.standard);
});
test('Util: cleanUrl Args & Fragment', () => {

    expect(Util.cleanUrl(testData.url.argsfragment)).toBe(testData.url.standard);
});
test('Util: cleanUrl Invalid Args & Fragment', () => {

    expect(Util.cleanUrl(testData.url.argsInvfragment)).toBe(testData.url.standard);
});

// Clean Title
test('Util: cleanTitle Simple', () => {

    expect(Util.cleanTitle(testData.title.simple)).toBe(testData.title.simple);
});
test('Util: cleanTitle Google', () => {

    expect(Util.cleanTitle(testData.title.google)).toBe(testData.title.simple);
});

// Filter
test('Util: filter', () => {
    const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const values = data.values();
    const filteredValues = Util.filter(values, (val) => val % 2 == 0);
    const result = Array.from(filteredValues);
    expect(result).toStrictEqual([0, 2, 4, 6, 8]);
});



