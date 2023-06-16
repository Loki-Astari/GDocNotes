
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.Data = require('../Data.js');
    global.Converter = require('../Converter.js');
    global.PageInfo = require('../PageInfo.js');
    global.Storage = require('../Storage.js');
    global.TestData = require('./data/TestData.js');
    global.mockStorage = {
        getItem: jest.fn().mockImplementation((name) => {return JSON.stringify(TestData.v2);}),
        setItem: jest.fn().mockImplementation((name, value) => true),
    };
});

afterAll(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks();
});


test('Storage: First Test', () => {
    expect(true);
});

test('Storage: Construct', () => {
    const storage = new Storage(mockStorage);
    expect(storage).not.toBeNull();
    expect(mockStorage.getItem).not.toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});

test('Storage: sessionStart simple return', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return false', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return false;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return null', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return null;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return undefined', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        var x;
        return x;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return true', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return true;
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).toHaveBeenCalled();
});
test('Storage: sessionStart return Array[0] == false', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return [false, 0];
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
});
test('Storage: sessionStart return Array[0] == true', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return [true, 0];
    });

    expect(mockStorage.getItem).toHaveBeenCalled();
    expect(mockStorage.setItem).toHaveBeenCalled();
});
test('Storage: sessionStart save value matches output', () => {
    const storage = new Storage(mockStorage);
    storage.sessionStart((session) => {
        return true;
    });

    expect(mockStorage.setItem.mock.calls[0][1]).toBe(JSON.stringify(TestData.v2));
});



