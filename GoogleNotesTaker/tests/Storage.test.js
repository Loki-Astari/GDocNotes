
var Storage = null;
beforeAll(async () => {
    process.env['NODE_DEV'] = 'TEST';
    Storage = require("../Storage.js");
});


test("Storage: First Test", () => {
    expect(true);
});
