
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.TestData = require('./data/TestData.js');
    global.Util = require('../Util.js');
    global.UIBuilder = require('../UIBuilder.js');
    global.PageInfo = require('../PageInfo.js');
    global.Data = require('../Data.js');
    global.Storage = require('../Storage.js');
    global.UI = require('../UI.js');

    global.mockStorage = {
        getItem: jest.fn().mockImplementation((name) => {return '{"version":2}';}),
        setItem: jest.fn().mockImplementation((name, value) => true),
    };
    global.Converter = {
        convert: jest.fn((x) => JSON.parse(JSON.stringify(testData.v2))),
    };
    global.GM_addStyle = jest.fn();
    global.window = {
        addEventListener: jest.fn(),
        scrollY: 0,
    };
    global.getElementById = {
        createElement:          jest.fn(() => {}),
        getElementById:         jest.fn(() => {}),
        getElementsByClassName: jest.fn(() => [{}]),
        addEventListener:       jest.fn(),
        visibilityState:        jest.fn(() => 'visible'),
    }
});

test('UI: First Test', () => {
    expect(true).toBe(true);
});

test('UI: Create', () => {

    const storage = new Storage(mockStorage);
    const uiBuilder = new UIBuilder();
    const ui = new UI(storage, uiBuilder, 'One');
});
