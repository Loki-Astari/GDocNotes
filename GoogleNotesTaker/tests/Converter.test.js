
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    global.Converter = require('../Converter.js');
    global.Data = require('../Data.js');
    global.testData = require('./data/TestData.js');
});

test('Converter: First Test', () => {
    expect(true).toBe(true);
});
test('Converter: Check Version', () => {
    expect(Converter.expectedVersion()).toBe(2);
});

test('Converter: V1', () => {

    result = Converter.convert(testData.v1);
    expect(result).toStrictEqual(testData.v2);
});

