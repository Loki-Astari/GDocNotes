
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.Converter = require('../Converter.js');
    global.testData = require('./data/TestData.js');
});

afterAll(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('Converter: First Test', () => {
    expect(true).toBe(true);
});

// Want this to break when we add a new converter.
// This will force it to be fixed and the correct new test to be added.
test('Converter: Check Version', () => {
    expect(Converter.expectedVersion()).toBe(2);
});

// convert V1 data to latest.
test('Converter: V1', () => {
    result = Converter.convert(testData.v1);
    expect(result).toStrictEqual(testData.v2);
});

// convert V2 data to latest.
test('Converter: V2', () => {
    result = Converter.convert(testData.v2);
    expect(result).toStrictEqual(testData.v2);
});

