
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
        convert: jest.fn((x) => JSON.parse(JSON.stringify(TestData.v2))),
    };
    const insertBefore = jest.fn();
    const getElementsByClassName = jest.fn(() => [createElement()]);
    const addEventListener = jest.fn();
    const setAttribute = jest.fn(() =>{});
    const createElement = jest.fn(() => {
        return {
            getElementById:         createElement,
            insertBefore:           insertBefore,
            getElementsByClassName: getElementsByClassName,
            addEventListener:       addEventListener,
            setAttribute:           setAttribute,
            style:                  {padding: ''},
            scrollY:                0,
        };
    });
    global.document = createElement();
    global.window = createElement();
});

afterAll(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('UI: First Test', () => {
    expect(true).toBe(true);
});

test('UI: Create', () => {

    const storage = new Storage(mockStorage);
    const uiBuilder = new UIBuilder();
    const ui = new UI(storage, uiBuilder, 'One');
    ui.createUI();
});
