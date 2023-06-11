
var StorageInterface = null;
beforeAll(async () => {
    process.env['NODE_DEV'] = 'TEST';
    StorageInterface = require("../StorageInterface.js");
});

test("StorageInterface: First Test", () => {
    expect(true);
});
