
var UI = null;
beforeAll(async () => {
    process.env['NODE_DEV'] = 'TEST';
    UI = require("../UI.js");
});

test("UI: First Test", () => {
    expect(true);
});
