
var UIBuilder = null;
var mockGM_addStyle = null;
beforeAll(() => {
    process.env['NODE_DEV'] = 'TEST';
    UIBuilder = require("../UIBuilder.js");
    mockGM_addStyle = jest.fn();
    global.GM_addStyle = mockGM_addStyle;
});

afterAll(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks();
});

function strip(text) {
    // Remove parts of the HTML
    //  1: Keep only the element remove any attributes.
    //  2: Remove newline followed by white space.
    //  3: Replace multiple space with a single space.
    return text.replace(/<([a-z]+)[^>]*>/g, '<$1>').replace(/[\r\n][ \t]*/g, '').replace(/[ \t]+/g, ' ');
}

function findAttribute(name, splitText, text) {
    // Drop leading white-space
    // Drop trailing white-space
    // Join all the lines.
    // split the lines by tag.
    const lineSplit = text.replace(/^[ \t\r\n]*/, '').replace(/[ \t\r\n]*$/, '').replace(/\r\n/g, '').replace(/>[^<]*</, '\n');

    // For each line (thus tag) extract the specific attribute.
    var findAttrExpression = new RegExp(`.*${name}="([^"]*)".*|(.*)`, "g");
    const attributes = lineSplit.replace(findAttrExpression, '$1');

    // Split by Line then split each line by 'splitText'
    const split = attributes.split('\n').map((item) => item.split(splitText));

    return split;
}

function findTextNodes(text) {
    // Drop leading white-space
    // Drop trailing white-space
    // Join all the lines.
    // split the lines by replacing tags with new line..
    const lineSplit = text.replace(/^[ \t\r\n]*/, '').replace(/[ \t\r\n]*$/, '').replace(/[\r\n]/g, '').replace(/<[^>]*>/g, '\n')

    return lineSplit.split('\n');
}

test("UIBuilder: First Test", () => {
    expect(true);
});

/* constructor() */
test("UIBuilder: Construct Object", () => {
    expect(mockGM_addStyle).not.toHaveBeenCalled();
    expect(new UIBuilder()).not.toBeNull();
    expect(mockGM_addStyle).toHaveBeenCalled();
});

/* buildLabelList(vector<string>& labelData) */
test("UIBuilder: buildLabelList Empty", () => {
    uiBuilder = new UIBuilder();

    expect(uiBuilder.buildLabelList([])).toBe('');
});
test("UIBuilder: buildLabelList Two Items", () => {
    uiBuilder = new UIBuilder();

    expect(strip(uiBuilder.buildLabelList(['one', 'two']))).toBe('<span>one </span><span>two </span>');
});
test("UIBuilder: buildLabelList three Items", () => {
    uiBuilder = new UIBuilder();

    expect(strip(uiBuilder.buildLabelList(['one', 'two', '3']))).toBe('<span>one </span><span>two </span><span>3 </span>');
});


/*
    template<typename T>
    buildListElement(vector<T>&                 list,
                     string                     cl,             // class name
                     function<string(T)>        actiontt,       // Tool Tip
                     function<string(T)>        deletett,       // Tool Tip for delete
                     function<string(T)>        object,         // The object to be displayed.
                     function<string(T)>        value           // The value attribute
                    ) {
    <div><div>${object}</div></div>
    ... repeat for each item in list
*/
test("UIBuilder: buildListElement Empty List", () => {
    uiBuilder = new UIBuilder();

    expect(strip(uiBuilder.buildListElement([], 'class', (item) => '', (item) => '', (item) => item, (item) => ''))).toBe('');
});
test("UIBuilder: buildListElement Two Items", () => {
    uiBuilder = new UIBuilder();

    expect(strip(uiBuilder.buildListElement(['One', 'Two'], '', (item) => '', (item) => '', (item) => item, (item) => ''))).toBe('<div><div>One</div></div><div><div>Two</div></div>');
});
test("UIBuilder: buildListElement Three Items", () => {
    uiBuilder = new UIBuilder();

    expect(strip(uiBuilder.buildListElement(['One', 'Two', '3'], '', (item) => '', (item) => '', (item) => item, (item) => ''))).toBe('<div><div>One</div></div><div><div>Two</div></div><div><div>3</div></div>');
});
test("UIBuilder: buildListElement Class added", () => {
    uiBuilder = new UIBuilder();

    const getAttributes = findAttribute("class", ' ', uiBuilder.buildListElement(['data'], 'x1', (item) => '', (item) => '', (item) => '', (item) => ''));
    // The first tag should have a class the contains 'x1'
    expect(getAttributes[0]).toEqual(expect.arrayContaining(['x1']))
});
test("UIBuilder: buildListElement Tool Tip", () => {
    uiBuilder = new UIBuilder();

    const toolTip = 'The tool tips you want to see'
    const getAttributes = findAttribute("data-tooltip", 'XX', uiBuilder.buildListElement(['data'], '', (item) => toolTip, (item) => '', (item) => '', (item) => ''));
    // The first tag should have a class the contains 'x1'
    expect(getAttributes[1][0]).toEqual(toolTip);
});
test("UIBuilder: buildListElement Delete Tool Tip", () => {
    uiBuilder = new UIBuilder();

    const toolTip = 'Deleting Something tool tips you want to see'
    const getAttributes = findAttribute("data-deletable-tt", 'XX', uiBuilder.buildListElement(['data'], '', (item) => '', (item) => toolTip, (item) => '', (item) => ''));
    // The first tag should have a class the contains 'x1'
    expect(getAttributes[0][0]).toEqual(toolTip);
});
test("UIBuilder: buildListElement Value", () => {
    uiBuilder = new UIBuilder();

    const value = 'TheValueOfTheNavigation'
    const getAttributes = findAttribute("value", 'XX', uiBuilder.buildListElement(['data'], '', (item) => '', (item) => '', (item) => '', (item) => value));
    // The first tag should have a class the contains 'x1'
    expect(getAttributes[0][0]).toEqual(value);
});
test("UIBuilder: buildListElement Item", () => {
    uiBuilder = new UIBuilder();

    const value = 'data';
    const html = uiBuilder.buildListElement([value], '', (item) => '', (item) => '', (item) => item, (item) => '');
    const textNodes = findTextNodes(html);
    // The first tag should have a class the contains 'x1'
    expect(textNodes.length).toBe(5);
    expect(textNodes[0]).toBe('');                          // between ^ <div>
    expect(textNodes[1].replace(/[ \t]/g, '')).toBe('');    // between <div> <div>      (removing write space. Don't care about extra)
    expect(textNodes[2]).toBe(value);                       // between <div> </div>     (Not removing white space. We want to make sure there is no space)
    expect(textNodes[3].replace(/[ \t]/g, '')).toBe('');    // between </div> </div>    (removing white space. Don't care about extra)
    expect(textNodes[4]).toBe('');                          // between </div> $

});

/*
    template<typename T>
    buildLabels({
        labelData[string...],           //  array of string
        labelsList[                     // Array of objects.
                                            An object is:
                                                "label" which we try and match against a value from labelData
                                                linkedPages: a list of pages that we will add
        {
            label,                      // name
            linkedPages[{
                display,
                page,
            }...]
        }....]
    }
                    ) {
    <div>${Header}</div>${buildListElement}
*/
test("UIBuilder: buildLabels Empty", () => {
    uiBuilder = new UIBuilder();

    const htmlText = uiBuilder.buildLabels({labelData: []});
    expect(htmlText).toBe('');
});
test("UIBuilder: buildLabels Two Items", () => {
    uiBuilder = new UIBuilder();

    const htmlText = uiBuilder.buildLabels({labelData: ['Red', 'Blue'], labelsList: []});//   {label:'Red',linkedPages:[]},{label:'Blue',linkedPages:[]}]});
    const textNodes = findTextNodes(htmlText);
    // The first tag should have a class the contains 'x1'
    expect(textNodes.length).toBe(5);
    expect(textNodes[0]).toBe('');                              // between ^ <div>
    expect(textNodes[1]).toBe('    Pages Labeled: Red');        // between <div> </div>
    expect(textNodes[2].replace(/[ \t]*/, '')).toBe('');        // between </div> <div>
    expect(textNodes[3]).toBe('    Pages Labeled: Blue');       // between <div> </div>
    expect(textNodes[4]).toBe('');                              // between </div> $
});
test("UIBuilder: buildLabels Two Items", () => {
    uiBuilder = new UIBuilder();

    const htmlmain = uiBuilder.buildLabels({labelData: ['Red'], labelsList: []});
    const htmlall = uiBuilder.buildLabels({labelData: ['Red'], labelsList: [{label:'Red',linkedPages:[{display:1,page:'One'},{display:2,page:'Two'}]},{label:'Blue',linkedPages:[{display:'A',page:'Alpha'},{display:'B',page:'Beta'}]}]});
    const htmltest = htmlall.replace(htmlmain, '');

    expect(htmlmain.length).not.toEqual(htmltest.length);
});

/*
    template<typename T>
    buildList(vector<T>&                 list,
                     function<string(T)>        cl,             // class name
                     function<string(T)>        actiontt,       // Tool Tip
                     function<string(T)>        deletett,       // Tool Tip for delete
                     function<string(T)>        object,         // The object to be displayed.
                     function<string(T)>        value           // The value attribute
                    ) {
    <div><div><div>${buildListElement}</div></div></div>
*/

/*
    build({
        noteData{
            note            // The note paged.
            display         // User displayable version of note (i.e. not URL)
            linkedPages     // pages linked to the note page
        },
        pageNote{
            linkedPages     // pages linked to this page.
        },
        labelData           // labels on this page


        notesList,          // list of all notes
        labelsList,         // list of all labels
    })
*/


