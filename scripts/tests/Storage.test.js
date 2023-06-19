
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.TestData = require('./data/TestData.js');
    global.Converter = {
        convert: jest.fn((x) => JSON.parse(JSON.stringify(TestData.v2))),
    };
    global.Data = require('../Data.js');
    jest.mock('../Data.js');
    global.Data.mockImplementation(() => {return {version:2};});
    global.Storage = require('../Storage.js');
    global.mockStorage = {
        getItem: jest.fn().mockImplementation((name) => {return JSON.stringify(TestData.v2);}),
        setItem: jest.fn().mockImplementation((name, value) => true),
    };
});

afterAll(() => {
    jest.restoreAllMocks();
});

var storage = null;
beforeEach(() => {
    storage = new Storage(mockStorage);
    jest.clearAllMocks();
});


test('Storage: First Test', () => {
    expect(true);
});

test('Storage: Construct', () => {
    expect(storage).not.toBeNull();
    expect(mockStorage.getItem).not.toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});

test('Storage: sessionStart simple return', () => {
    storage.sessionStart((session) => {
        return;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return false', () => {
    storage.sessionStart((session) => {
        return false;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return null', () => {
    storage.sessionStart((session) => {
        return null;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return undefined', () => {
    storage.sessionStart((session) => {
        var x;
        return x;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return true', () => {
    storage.sessionStart((session) => {
        return true;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).toHaveBeenCalled();
});
test('Storage: sessionStart return Array[0] == false', () => {
    const result = storage.sessionStart((session) => {
        return [false, 15];
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
    expect(result).toBe(15);
});
test('Storage: sessionStart return Array[0] == true', () => {
    const result = storage.sessionStart((session) => {
        return [true, 22];
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).toHaveBeenCalled();
    expect(result).toBe(22);
});
test('Storage: sessionStart save value matches output', () => {
    storage.sessionStart((session) => {
        return true;
    });

    expect(mockStorage.setItem.mock.calls[0][1]).toBe(JSON.stringify({version:2}));
});



