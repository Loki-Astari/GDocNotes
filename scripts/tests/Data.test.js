
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
    PageInfo.buildCount = function() {
        return PageInfo.buildDuplicateWithReplace.mock.calls.length
             + PageInfo.buildPageInfoFromValue.mock.calls.length
             + PageInfo.buildPageInfoFromObject.mock.calls.length
    }
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
    expect(PageInfo.buildCount()).toBe(1);
});

test('Data: Modification: setNote', () => {
    data.setNote('One', 'Fifteen');
    // Change One. Fix Two. Add Fifteen
    expect(PageInfo.buildCount()).toBe(3);
    expect(data.getPage('One').noteUrl).toBe('Fifteen');
    expect(data.getPage('Two').linkedPages).not.toContain('One');
    expect(data.getPage('Fifteen').linkedPages).toContain('One');
});

test('Data: Modification: remPageNote', () => {
    data.setNote('One', '');
    // Change One. Fix Two.
    expect(PageInfo.buildCount()).toBe(2);
    expect(data.getPage('One').noteUrl).toBe('');
    expect(data.getPage('Two').linkedPages).not.toContain('One');
});

test('Data: Modification: addPageLabel Existing to Already Done', () => {
    data.addLabel('Six', 'Red');
    // No change.
    expect(PageInfo.buildCount()).toBe(0);
});

test('Data: Modification: addPageLabel Existing to Empty', () => {
    data.addLabel('One', 'Red');
    // Change One
    expect(PageInfo.buildCount()).toBe(1);
    expect(data.getPage('One').labels).toContain('Red');
    expect(data.getLabel('Red')).toContain('One');
});

test('Data: Modification: addPageLabel New to Empty', () => {
    data.addLabel('Two', 'LeftField');
    // Change Two
    expect(PageInfo.buildCount()).toBe(1);
    expect(data.getPage('Two').labels).toContain('LeftField');
    expect(data.getLabel('LeftField')).toContain('Two');
});

test('Data: Modification: addPageLabel New to not empty', () => {
    data.addLabel('Six', 'LeftField');
    // Change Six
    expect(PageInfo.buildCount()).toBe(1);
    expect(data.getPage('Six').labels).toContain('LeftField');
    expect(data.getLabel('LeftField')).toContain('Six');
});

test('Data: Modification: remPageLabel that exists', () => {
    data.remLabel('Five', 'Red');
    // Changes Five
    expect(PageInfo.buildCount()).toBe(1);
    expect(data.getPage('Five').labels).not.toContain('Red');
    expect(data.getLabel('Red')).not.toContain('Five');
});

test('Data: Modification: remPageLabel that does not exists', () => {
    data.remLabel('Five', 'LeftField');
    // No Change
    expect(PageInfo.buildCount()).toBe(0);
});

test('Data: Delete Note that does not exit', () => {
    data.deleteNote('One');
    expect(PageInfo.buildCount()).toBe(0);
});

test('Data: Delete Note that exits', () => {
    data.deleteNote('Two');
    // Fix One, Three, Four, Five
    // Update Two
    expect(PageInfo.buildCount()).toBe(5);
    expect(data.notes).not.toContain('Two');
    expect(data.getPage('One').noteUrl).toBe('');
    expect(data.getPage('Three').noteUrl).toBe('');
    expect(data.getPage('Four').noteUrl).toBe('');
    expect(data.getPage('Five').noteUrl).toBe('');
    expect(Array.from(data.getPage('Two').linkedPages).length).toBe(0);
});

test('Data: Delete Label that does not exit', () => {
    data.deleteLabel('LeftField');
    // No Change
    expect(PageInfo.buildCount()).toBe(0);
});

test('Data: Delete Label that exits', () => {
    data.deleteLabel('MarketPlace');
    expect(PageInfo.buildCount()).toBe(2);
    expect(data.labels).not.toContain('MarketPlace');
    expect(data.getPage('Five').labels).not.toContain('MarketPlace');
    expect(data.getPage('Seven').labels).not.toContain('MarketPlace');
});

