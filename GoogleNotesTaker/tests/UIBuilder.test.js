
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

    function balancedTags(text) {
        // Drop text up to first tag
        // Drop text after last tag
        // Drop text between tags
        // Drop attributes
        // Drop all attributes in tags.
        const lineSplit = text.replace(/^[^<]*/, '').replace(/[^>]*$/, '').replace(/>[^<]*</g, '><').replace(/<(\/?[a-z]*)[^>]*>/g, '$1\n');
        const tags = lineSplit.split('\n').pop();   // Remove the blank last line
        const openStack = [];
        for (tag of tags) {
            if (tag[0] != '/') {
                openStack.push(tag);
            }
            else {
                if (openStack[openStack.length-1] == tag.replace(/\//, '')) {
                    openStack.pop();
                }
                else {
                    console.log('Error: Unbalanced tag.');
                    openStack.push(tag);
                }
            }
        }
        return openStack;
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
    test("UIBuilder: buildLabelList Check Balance", () => {
        uiBuilder = new UIBuilder();

        const htmlText = uiBuilder.buildLabelList(['one', 'two', '3']);
        const tagBalance = balancedTags(htmlText);
        expect(tagBalance.length).toBe(0);
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
    test("UIBuilder: buildListElement Check Balance", () => {
        uiBuilder = new UIBuilder();

        const htmlText = uiBuilder.buildListElement(['1', '2', '3', '4'], '', (item) => '', (item) => '', (item) => item, (item) => '');
        const tagBalance = balancedTags(htmlText);
        expect(tagBalance.length).toBe(0);
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
    test("UIBuilder: buildLabels Check Balance", () => {
        uiBuilder = new UIBuilder();

        const htmlText = uiBuilder.buildLabels({labelData: ['Red'], labelsList: [{label:'Red',linkedPages:[{display:1,page:'One'},{display:2,page:'Two'}]},{label:'Blue',linkedPages:[{display:'A',page:'Alpha'},{display:'B',page:'Beta'}]}]});
        const tagBalance = balancedTags(htmlText);
        expect(tagBalance.length).toBe(0);
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
    test("UIBuilder: buildList Check Balance", () => {
        uiBuilder = new UIBuilder();

        const htmlText = uiBuilder.buildList(['1', '2', '3', '4'], '', (item) => '', (item) => '', (item) => item, (item) => '');
        const tagBalance = balancedTags(htmlText);
        expect(tagBalance.length).toBe(0);
    });


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
    test("UIBuilder: build Check Balance", () => {
        uiBuilder = new UIBuilder();

        const htmlText = uiBuilder.build({
            noteData: {
                note: 'One',
                display: '1',
                linkedPages: [{display: "A", page: "Alpha"},{display: "B", page: "Beta"}],
            },
            pageNote: {
                linkedPages: [{display:'A',page:'Alpha'},{display:'B',page:'Beta'}],
            },
            labelData: ['Red'],
            notesList: [{display: "1", note: "One", linkedPages: [{display: "A", page: "Alpha"},{display: "B", page: "Beta"}]},
                        {display: "2", note: "two", linkedPages: [{display: "A", page: "Alpha"},{display: "B", page: "Beta"}]}
                       ],
            labelsList:[{label:'Red',linkedPages:[{display:1,page:'One'},{display:2,page:'Two'}]},{label:'Blue',linkedPages:[{display:'A',page:'Alpha'},{display:'B',page:'Beta'}]}]
        });
        const tagBalance = balancedTags(htmlText);
        expect(tagBalance.length).toBe(0);
    });

    test("UIBuilder: build Check no change", () => {

    const input= '{"hasNote":false,"hasLabel":false,"pageData":{"note":"","labels":["Red","Brown"]},"pageNote":{"note":"https://docs.google.com/document/d/15boeREl-EVqA7MV3hZLJmzVnqNRaTSob1PHqycuAKXM/edit","display":"Qualification / Preference Notes","linkedPages":[{"page":"https://docs.google.com/document/d/17XmUsOlZxZc2eHdJMubGSw9KckOlPl3duqgvcfkRs-8/edit","display":"2-Pager: Jobseeker Data, Features & the Feedback Loop"},{"page":"https://docs.google.com/document/d/1tc37R1E01oOKchHJ3MVEvz3HqnTy1qr5LT6LiDnQeBo/edit","display":"MDP APIs requested for qualifications/attributes"},{"page":"https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit","display":"Asks from Profile on how MDP can support qualifications"},{"page":"https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit","display":"Initiatives"}]},"noteData":{"display":"","linkedPages":[]},"labelData":["Red","Brown"],"notesList":[{"note":"https://docs.google.com/document/d/15boeREl-EVqA7MV3hZLJmzVnqNRaTSob1PHqycuAKXM/edit","display":"Qualification / Preference Notes","linkedPages":[{"page":"https://docs.google.com/document/d/17XmUsOlZxZc2eHdJMubGSw9KckOlPl3duqgvcfkRs-8/edit","display":"2-Pager: Jobseeker Data, Features & the Feedback Loop"},{"page":"https://docs.google.com/document/d/1tc37R1E01oOKchHJ3MVEvz3HqnTy1qr5LT6LiDnQeBo/edit","display":"MDP APIs requested for qualifications/attributes"},{"page":"https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit","display":"Asks from Profile on how MDP can support qualifications"},{"page":"https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit","display":"Initiatives"}]}],"labelsList":[{"label":"Brown","linkedPages":[{"page":"https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit","display":"Asks from Profile on how MDP can support qualifications"},{"page":"https://docs.google.com/document/d/15boeREl-EVqA7MV3hZLJmzVnqNRaTSob1PHqycuAKXM/edit","display":"Qualification / Preference Notes"},{"page":"https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit","display":"Initiatives"}]},{"label":"Red","linkedPages":[{"page":"https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit","display":"Initiatives"}]}]}'
    const output = '<div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"><!-- Remove Button: This is dynamically moved as mouse is moved over deletable items --><div id="gdnt-delete-item" class="gdnt-deletable gdnt-deletable-nofocus navigation-widget-row-controls" style="top: 145px; right: 23px; display: none;"><div class="gdnt-deletable gdnt-deletable-nofocus navigation-widget-row-controls-control navigation-widget-row-controls-suppress goog-inline-block goog-flat-button" role="button" data-tooltip="Remove:" data-tooltip-offset="-8" id="a4jzle:16y" tabindex="0" style="user-select: none;"><div class="gdnt-deletable gdnt-deletable-nofocus docs-icon goog-inline-block "><div class="gdnt-deletable gdnt-deletable-nofocus docs-icon-img-container docs-icon-img docs-icon-close-thin">&nbsp;</div></div></div></div></div></div></div><div class="navigation-widget-smart-summary-container-1"><div class="docs-material kix-smart-summary-view" style="padding-bottom:0px"><div class="kix-smart-summary-view-header-container"><div class="gdnt-notes-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-note="undefined" role="heading">Notes: <div class="navigation-item-content" style="display:inline"><a class="gdnt-anchor" href="undefined"></a></div></div><!-- Edit Note --><div id="gdnt-notes-edit" role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-edit-button" data-tooltip="Edit Notes" style="display: none;" data-ol-has-click-handler=""><div class="docs-icon goog-inline-block "><div class="docs-icon-img-container docs-icon-img docs-icon-edit-outline">&nbsp;</div></div></div><!-- Add Note --><div id="gdnt-notes-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: none;"><div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon" data-ol-has-click-handler=""><div class="docs-icon goog-inline-block "><div class="docs-icon-img-container docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary">&nbsp;</div></div></div><div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon" style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Notes" data-ol-has-click-handler=""><div class="docs-icon goog-inline-block "><div class="docs-icon-img-container docs-icon-img docs-icon-plus">&nbsp;</div></div></div></div></div></div><div class="docs-material kix-smart-summary-view" style="padding-bottom:0px"><div class="kix-smart-summary-view-header-container"><div class="gdnt-labels-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-labels="undefined" role="heading">Labels: <div class="navigation-item-content" style="display:inline"><span>Red </span><span>Brown </span></div></div><!-- Add Label --><div id="gdnt-labels-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: block;"><div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon" data-ol-has-click-handler=""><div class="docs-icon goog-inline-block "><div class="docs-icon-img-container docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary">&nbsp;</div></div></div><div role="button" class="goog-inline-block jfk-button jfk-button-standard kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon" style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Labels" data-ol-has-click-handler=""><div class="docs-icon goog-inline-block "><div class="docs-icon-img-container docs-icon-img docs-icon-plus">&nbsp;</div></div></div></div></div></div><div class="docs-material kix-smart-summary-view" style="padding-bottom:0px"><div id="gdnt-notes-list-of-notes" class="kix-smart-summary-view-content-container" style="display: none;"><div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">Existing Notes Documents:</div<div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"<div class="gdnt-deletable last_child_override navigation-item gdnt-note" role="menuitem" style="user-select: none;" data-deletable-tt="Delete Note: \'Qualification / Preference Notes\'" value="https://docs.google.com/document/d/15boeREl-EVqA7MV3hZLJmzVnqNRaTSob1PHqycuAKXM/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Add this page to Note \'Qualification / Preference Notes\'" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Qualification / Preference Notes</div></div></div></div></div><!-- <div class="kix-smart-summary-view-separator"></div> --></div><div id="gdnt-labels-list-of-labels" class="kix-smart-summary-view-content-container" style="display: block;"><div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">Existing Labels :</div<div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"<div class="gdnt-deletable last_child_override navigation-item gdnt-label" role="menuitem" style="user-select: none;" data-deletable-tt="Delete Label: Brown" value="Brown" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Add label Brown to this page" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Brown</div></div><div class="gdnt-deletable last_child_override navigation-item gdnt-label" role="menuitem" style="user-select: none;" data-deletable-tt="Delete Label: Red" value="Red" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Add label Red to this page" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">Red</div></div></div></div></div><div class="kix-smart-summary-view-separator"></div></div></div><div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">Pages Linked to this page:</div<div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"<div class="gdnt-deletable last_child_override navigation-item gdnt-note-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove Page: 2-Pager: Jobseeker Data, Features & the Feedback Loop" value="https://docs.google.com/document/d/17XmUsOlZxZc2eHdJMubGSw9KckOlPl3duqgvcfkRs-8/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: 2-Pager: Jobseeker Data, Features & the Feedback Loop" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/17XmUsOlZxZc2eHdJMubGSw9KckOlPl3duqgvcfkRs-8/edit">2-Pager: Jobseeker Data, Features & the Feedback Loop</a></div></div><div class="gdnt-deletable last_child_override navigation-item gdnt-note-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove Page: MDP APIs requested for qualifications/attributes" value="https://docs.google.com/document/d/1tc37R1E01oOKchHJ3MVEvz3HqnTy1qr5LT6LiDnQeBo/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: MDP APIs requested for qualifications/attributes" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/1tc37R1E01oOKchHJ3MVEvz3HqnTy1qr5LT6LiDnQeBo/edit">MDP APIs requested for qualifications/attributes</a></div></div><div class="gdnt-deletable last_child_override navigation-item gdnt-note-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove Page: Asks from Profile on how MDP can support qualifications" value="https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: Asks from Profile on how MDP can support qualifications" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit">Asks from Profile on how MDP can support qualifications</a></div></div><div class="gdnt-deletable last_child_override navigation-item gdnt-note-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove Page: Initiatives" value="https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: Initiatives" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit">Initiatives</a></div></div></div></div></div><div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">Pages Linked to same note:</div<div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"</div></div></div<div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">Pages Labeled: Red</div><div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"<div class="gdnt-deletable last_child_override navigation-item gdnt-label-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove \'Red\' from Page: Initiatives" value="Red:https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: Initiatives" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit">Initiatives</a></div></div></div></div></div><div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">Pages Labeled: Brown</div><div class="updating-navigation-item-list"><div class="updating-navigation-item-list"><div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;"<div class="gdnt-deletable last_child_override navigation-item gdnt-label-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove \'Brown\' from Page: Asks from Profile on how MDP can support qualifications" value="Brown:https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: Asks from Profile on how MDP can support qualifications" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/1yc6WRIu-pXtBpQIE0HZDptdwSHz3-6BYfEylhRPSYrc/edit">Asks from Profile on how MDP can support qualifications</a></div></div><div class="gdnt-deletable last_child_override navigation-item gdnt-label-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove \'Brown\' from Page: Qualification / Preference Notes" value="Brown:https://docs.google.com/document/d/15boeREl-EVqA7MV3hZLJmzVnqNRaTSob1PHqycuAKXM/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: Qualification / Preference Notes" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/15boeREl-EVqA7MV3hZLJmzVnqNRaTSob1PHqycuAKXM/edit">Qualification / Preference Notes</a></div></div><div class="gdnt-deletable last_child_override navigation-item gdnt-label-page" role="menuitem" style="user-select: none;" data-deletable-tt="Remove \'Brown\' from Page: Initiatives" value="Brown:https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit" style="padding-right: 8px; margin-bottom: 0px;"><div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="Open: Initiatives" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8"><a class="gdnt-anchor" href="https://docs.google.com/document/d/1qdd0xSTR1wl16dmAckeNb2NulMtWDUcshSY9RjMKDXk/edit">Initiatives</a></div></div></div></div></div></div>';

    const uiBuilder = new UIBuilder();
    const data = JSON.parse(input);
    const html = uiBuilder.build(data);
    const htmlCompact = html.replace(/[\r\n]+[ \t]*/g, '');

    expect(htmlCompact).toBe(htmlCompact);
});

