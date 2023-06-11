
var UIBuilder = null;
beforeAll(async () => {
    process.env['NODE_DEV'] = 'TEST';
    UIBuilder = require("../UIBuilder.js");
});

test("UIBuilder: First Test", () => {
    expect(true);
});
