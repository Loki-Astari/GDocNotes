
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.PageInfo = require('../PageInfo.js');
});

test('PageInfo: First Test', () => {
    expect(true).toBe(true);
});
test('PageInfo: Construct Label', () => {
    const page = new PageInfo('One');
    expect(page.url).toBe('One');
    expect(page.display).toBe('Not Google Doc');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Construct Object Url', () => {
    const page = new PageInfo({url: 'One'});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Construct Object Url/Display', () => {
    const page = new PageInfo({url: 'One', display: 'Two'});
    expect(page.url).toBe('One');
    expect(page.display).toBe('Two');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Construct Object Url/NoteURL', () => {
    const page = new PageInfo({url: 'One', noteUrl: 'Two'});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('Two');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Construct Object Url/Labesl', () => {
    const page = new PageInfo({url: 'One', labels: ['One', 'Two']});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual(['One', 'Two']);
    expect(Array.from(page.linkedPages)).toStrictEqual([]);
});
test('PageInfo: Construct Object Url/linkedPages', () => {
    const page = new PageInfo({url: 'One', linkedPages: ['One', 'Two']});
    expect(page.url).toBe('One');
    expect(page.display).toBe('');
    expect(page.noteUrl).toBe('');
    expect(Array.from(page.labels)).toStrictEqual([]);
    expect(Array.from(page.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: Serialize', () => {
    const page = new PageInfo({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    expect(JSON.stringify(page)).toBe('{"url":"One","display":"Two","noteUrl":"Three","labels":["A","B","C"],"linkedPages":["One","Two"]}');
});
test('PageInfo: duplicateWithReplace URL', () => {
    const page1 = new PageInfo({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.duplicateWithReplace(page1, {url: 'Alpha'});
    expect(page2.url).toBe('Alpha');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: duplicateWithReplace Display', () => {
    const page1 = new PageInfo({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.duplicateWithReplace(page1, {display: 'Alpha'});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Alpha');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: duplicateWithReplace NoteUrl', () => {
    const page1 = new PageInfo({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.duplicateWithReplace(page1, {noteUrl: 'Alpha'});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Alpha');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: duplicateWithReplace Labels', () => {
    const page1 = new PageInfo({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.duplicateWithReplace(page1, {labels: ['Alpha', 'Beta', 'Gama']});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['Alpha', 'Beta', 'Gama']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['One', 'Two']);
});
test('PageInfo: duplicateWithReplace LinkedPages', () => {
    const page1 = new PageInfo({url: 'One', display: 'Two', noteUrl: 'Three', labels: ['A', 'B', 'C'], linkedPages: ['One', 'Two']});
    const page2 = PageInfo.duplicateWithReplace(page1, {linkedPages: ['Alpha', 'Beta', 'Gama']});
    expect(page2.url).toBe('One');
    expect(page2.display).toBe('Two');
    expect(page2.noteUrl).toBe('Three');
    expect(Array.from(page2.labels)).toStrictEqual(['A', 'B', 'C']);
    expect(Array.from(page2.linkedPages)).toStrictEqual(['Alpha', 'Beta', 'Gama']);
});

test('PageInfo: Stringify', () => {
    const input = {url:'1', display:'2',noteUrl:'3',labels:['1','2','3'],linkedPages:['A','B','C']};
    const data = new PageInfo(input);
    expect(JSON.stringify(data)).toBe(JSON.stringify(input));
});

