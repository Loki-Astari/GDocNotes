
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.testData = require('./data/TestData.js');
    global.Converter = {
        convert: jest.fn((x) => JSON.parse(JSON.stringify(testData.v2))),
    };
    global.Util = require('../Util.js');
    global.PageInfo = require('../PageInfo.js');
    global.Data = require('../Data.js');

    jest.spyOn(PageInfo, 'buildDuplicateWithReplace');
    jest.spyOn(PageInfo, 'buildPageInfoFromValue');
    jest.spyOn(PageInfo, 'buildPageInfoFromObject');
});

afterAll(() => {
    jest.restoreAllMocks();
});

var data = null;
beforeEach(() => {
    // Note the object created is from the mock converter.
    data = new Data('{"version":2}');

    // Reset all mock functionality
    jest.clearAllMocks();
});

test('Data: First Test', () => {
    expect(true).toBe(true);
});

// Step 1: Validate that the test data is as expected.
//  Note:       One Note
//  Labels:     Two Labels
//  Pages:      Seven Pages
test('Data V2: Check Notes', () => {
    const notes = data.notes;
    expect(notes.next()).toEqual({done:false, value: 'Two'});
    expect(notes.next().done).toEqual(true);
});
test('Data V2: Check Labels', () => {
    const labels = data.labels;
    expect(labels.next()).toEqual({done:false, value: 'Red'});
    expect(labels.next()).toEqual({done:false, value: 'MarketPlace'});
    expect(labels.next().done).toEqual(true);
});
test('Data V2: Check Page 1', () => {
    const page1 = data.getPage('One');
    expect(page1).not.toBeNull();
    expect(page1.display).toBe('Company OKR');
    expect(page1.noteUrl).toBe('Two');
    expect(page1.labels.next().done).toBe(true);
    expect(page1.linkedPages.next().done).toBe(true);
});
test('Data V2: Check Page 2', () => {
    const page2 = data.getPage('Three');
    expect(page2).not.toBeNull();
    expect(page2.display).toBe('Team OKR');
    expect(page2.noteUrl).toBe('Two');
    expect(page2.labels.next().done).toBe(true);
    expect(page2.linkedPages.next().done).toBe(true);
});
test('Data V2: Check Page 3', () => {
    const page3 = data.getPage('Four');
    expect(page3).not.toBeNull();
    expect(page3.display).toBe('DepartmentOKR');
    expect(page3.noteUrl).toBe('Two');
    expect(page3.labels.next().done).toBe(true);
    expect(page3.linkedPages.next().done).toBe(true);
});
test('Data V2: Check Page 4', () => {
    const page4 = data.getPage('Five');
    expect(page4).not.toBeNull();
    expect(page4.display).toBe('Personal OKR');
    expect(page4.noteUrl).toBe('Two');
    const l1 = page4.labels;
    const page4Labels = page4.labels;
    expect(page4Labels.next()).toStrictEqual({done: false, value: 'Red'});
    expect(page4Labels.next()).toStrictEqual({done: false, value: 'MarketPlace'});
    expect(page4Labels.next().done).toBe(true);
    expect(page4.linkedPages.next().done).toBe(true);
});
test('Data V2: Check Page 5', () => {
    const page5 = data.getPage('Six');
    expect(page5).not.toBeNull();
    expect(page5.display).toBe('The Quest');
    expect(page5.noteUrl).toBe('');
    const page5Labels = page5.labels;
    expect(page5Labels.next()).toStrictEqual({done: false, value: 'Red'});
    expect(page5Labels.next().done).toBe(true);
    expect(page5.linkedPages.next().done).toBe(true);
});
test('Data V2: Check Page 6', () => {
    const page6 = data.getPage('Seven');
    expect(page6).not.toBeNull();
    expect(page6.display).toBe('Market Opertunities');
    expect(page6.noteUrl).toBe('');
    const page6Labels = page6.labels;
    expect(page6Labels.next()).toStrictEqual({done: false, value: 'MarketPlace'});
    expect(page6Labels.next().done).toBe(true);
    expect(page6.linkedPages.next().done).toBe(true);
});
test('Data V2: Check Page 7', () => {
    const page7 = data.getPage('Two');
    expect(page7).not.toBeNull();
    expect(page7.display).toBe('OKR Notes');
    expect(page7.noteUrl).toBe('');
    expect(page7.labels.next().done).toBe(true);
    const page7LinkedPages = page7.linkedPages;
    expect(page7LinkedPages.next()).toStrictEqual({done: false, value: 'One'});
    expect(page7LinkedPages.next()).toStrictEqual({done: false, value: 'Three'});
    expect(page7LinkedPages.next()).toStrictEqual({done: false, value: 'Four'});
    expect(page7LinkedPages.next()).toStrictEqual({done: false, value: 'Five'});
    expect(page7LinkedPages.next().done).toBe(true);
});


// Step 2: Check functionality
//
test('Data: Modification: setDisplay', () => {
    data.setDisplay('One', 'Fifteen');
    expect(data.getPage('One').display).toBe('Fifteen');
    expect(PageInfo.buildDuplicateWithReplace).toHaveBeenCalledTimes(1);
    expect(PageInfo.buildPageInfoFromValue).toHaveBeenCalledTimes(0);
    expect(PageInfo.buildPageInfoFromObject).toHaveBeenCalledTimes(0);
});

test('Data: Modification: setNote', () => {
    data.setNote('One', 'Fifteen');
    expect(data.getPage('One').noteUrl).toBe('Fifteen');
    expect(Array.from(data.getPage('Two').linkedPages).find((obj) => obj == 'One')).toBeUndefined();
    expect(Array.from(data.getPage('Fifteen').linkedPages).find((obj) => obj == 'One')).toBe('One');

});

test('Data: Modification: remPageNote', () => {
    data.setNote('One', '');
    expect(data.getPage('One').noteUrl).toBe('');
    expect(Array.from(data.getPage('Two').linkedPages).find((obj) => obj == 'One')).toBeUndefined();
});

test('Data: Modification: addPageLabel Existing to Already Done', () => {
    expect(Array.from(data.getPage('Six').labels).length).toBe(1);
    expect(Array.from(data.getLabel('Red')).length).toBe(2);
    data.addLabel('Six', 'Red');
    expect(Array.from(data.getPage('Six').labels).length).toBe(1);
    expect(Array.from(data.getLabel('Red')).length).toBe(2);
});

test('Data: Modification: addPageLabel Existing to Empty', () => {
    expect(Array.from(data.getPage('One').labels).length).toBe(0);
    expect(Array.from(data.getLabel('Red')).length).toBe(2);
    data.addLabel('One', 'Red');
    expect(Array.from(data.getPage('One').labels).length).toBe(1);
    expect(Array.from(data.getLabel('Red')).length).toBe(3);
});

test('Data: Modification: addPageLabel New to Empty', () => {
    data.addLabel('Two', 'LeftField');
    expect(Array.from(data.getPage('Two').labels).length).toBe(1);
    expect(Array.from(data.getLabel('LeftField')).length).toBe(1);
});

test('Data: Modification: addPageLabel New to not empty', () => {
    data.addLabel('Six', 'LeftField');
    expect(Array.from(data.getPage('Six').labels).length).toBe(2);
    expect(Array.from(data.getLabel('LeftField')).length).toBe(1);
});

test('Data: Modification: remPageLabel that exists', () => {
    data.remLabel('Five', 'Red');
    expect(Array.from(data.getPage('Five').labels).length).toBe(1);
    expect(Array.from(data.getLabel('Red')).length).toBe(1);
});

test('Data: Modification: remPageLabel that does not exists', () => {
    data.remLabel('Five', 'LeftField');
    expect(Array.from(data.getPage('Five').labels).length).toBe(2);
    expect(Array.from(data.getLabel('LeftField')).length).toBe(0);
});

test('Data: Delete Note that does not exit', () => {
    data.deleteNote('One');
    expect(Array.from(data.notes).length).toBe(1);
    expect(data.getPage('Two').noteUrl).toBe('');
});

test('Data: Delete Note that exits', () => {
    data.deleteNote('Two');
    expect(Array.from(data.notes).length).toBe(0);
    expect(data.getPage('One').noteUrl).toBe('');
    expect(data.getPage('Two').noteUrl).toBe('');
    expect(Array.from(data.getPage('Two').linkedPages).length).toBe(0);
});

test('Data: Delete Label that does not exit', () => {
    data.deleteLabel('LeftField');
    expect(Array.from(data.labels).length).toBe(2);
    expect(Array.from(data.getPage('One').labels).length).toBe(0);
    expect(Array.from(data.getPage('Six').labels).length).toBe(1);
    expect(Array.from(data.getPage('Five').labels).length).toBe(2);
});

test('Data: Delete Label that exits', () => {
    data.deleteLabel('MarketPlace');
    expect(Array.from(data.labels).length).toBe(1);
    expect(Array.from(data.getPage('Five').labels).length).toBe(1);
    expect(Array.from(data.getPage('Seven').labels).length).toBe(0);
});

