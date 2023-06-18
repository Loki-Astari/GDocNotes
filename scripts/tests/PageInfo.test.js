
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.PageInfo = require('../PageInfo.js');
});

afterAll(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('PageInfo: First Test', () => {
    expect(true).toBe(true);
});
test('PageInfo: Construct Label', () => {
    const page = new PageInfo('One', 'Two', 'Three', [1, 2], ['A', 'B']);
    expect(page.url).toBe('One');
    expect(page.display).toBe('Two');
    expect(page.noteUrl).toBe('Three');
    expect(Array.from(page.labels)).toStrictEqual([1, 2]);
    expect(Array.from(page.linkedPages)).toStrictEqual(['A', 'B']);
});
test('PageInfo: Build Label', () => {
    const page = PageInfo.buildPageInfoFromValue('One');
    expect(page.url).toBe('One');
    expect(page.display).toBe('One');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Build Label Display', () => {
    const page = PageInfo.buildPageInfoFromValue('One', 'Two');
    expect(page.url).toBe('One');
    expect(page.display).toBe('Two');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Build Object Url', () => {
    const page = PageInfo.buildPageInfoFromObject({url: 'One'});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Build Object Url/Display', () => {
    const page = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two'});
    expect(page.url).toBe('One');
    expect(page.display).toBe('Two');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Build Object Url/NoteURL', () => {
    const page = PageInfo.buildPageInfoFromObject({url: 'One', noteUrl: 'Two'});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('Two');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Build Object Url/Labesl', () => {
    const page = PageInfo.buildPageInfoFromObject({url: 'One', labels: ['One', 'Two']});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual(['One', 'Two']);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Build Object Url/linkedPages', () => {
    const page = PageInfo.buildPageInfoFromObject({url: 'One', linkedPages: ['One', 'Two']});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: Serialize', () => {
    const page = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    expect(JSON.stringify(page)).toBe('{"url":"One","display":"Two","noteUrl":"Three","labels":["A","B","C"],"linkedPages":["One","Two"]}');
});
test('PageInfo: buildDuplicateWithReplace URL', () => {
    const page1 = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.buildDuplicateWithReplace(page1, {url: 'Alpha'});
    expect(page2.url).toBe('Alpha');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: buildDuplicateWithReplace Display', () => {
    const page1 = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.buildDuplicateWithReplace(page1, {display: 'Alpha'});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Alpha');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: buildDuplicateWithReplace NoteUrl', () => {
    const page1 = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.buildDuplicateWithReplace(page1, {noteUrl: 'Alpha'});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Alpha');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: buildDuplicateWithReplace Labels', () => {
    const page1 = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.buildDuplicateWithReplace(page1, {labels: ['Alpha', 'Beta', 'Gama']});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['Alpha', 'Beta', 'Gama']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: buildDuplicateWithReplace LinkedPages', () => {
    const page1 = PageInfo.buildPageInfoFromObject({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.buildDuplicateWithReplace(page1, {linkedPages: ['Alpha', 'Beta', 'Gama']});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['Alpha', 'Beta', 'Gama']);
});

test('PageInfo: Stringify', () => {
    const input = {url:'1', display:'2',noteUrl:'3',labels:['1','2','3'],linkedPages:['A','B','C']};
    const data = PageInfo.buildPageInfoFromObject(input);
    expect(JSON.stringify(data)).toBe(JSON.stringify(input));
});

