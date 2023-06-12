class UIBuilder {

    constructor() {
        GM_addStyle ( `
            div.gdnt-note {
                color: green;
            }
            a.gdnt-anchor {
                color: inherit;
                text-decoration: none;
            }
            a.gdnt-anchor:hover {
                color:#0B57D0;
                text-decoration:none;
                cursor:pointer;
            }
            .navigation-widget .updating-navigation-item-list .navigation-item-list .last_child_override {
                margin-bottom:  0;
                font-size:      11px;
                line-height:    28px;
            }
            .navigation-widget .updating-navigation-item-list .navigation-item-list .gdnt-note .navigation-item-level-1 {
                padding-left: 0px;
            }
            .navigation-widget .updating-navigation-item-list .navigation-item-list .gdnt-label .navigation-item-level-1 {
                padding-left: 0px;
            }
        `);
    }

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
    buildLabelList(labelData) {
        var output = '';
        for (const label of labelData) {
            output += `<span>${label} </span>`;

        }
        return output;
    }

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
    buildListElement(list, cl, actiontt, deletett, object, value) {
        var output = '';
        for (const linkPage of list) {
            output += `
<div class="gdnt-deletable last_child_override navigation-item ${cl}" role="menuitem" style="user-select: none;" data-deletable-tt="${deletett(linkPage)}" value="${value(linkPage)}" style="padding-right: 8px; margin-bottom: 0px;">
    <div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="${actiontt(linkPage)}" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">${object(linkPage)}</div>
</div>`;
        }
        return output;
    }

    buildList(list, cl, actiontt, deletett, object, value) {
        return `
        <div class="updating-navigation-item-list">
            <div class="updating-navigation-item-list">
                <div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;">
                    ${this.buildListElement(list, cl, actiontt, deletett, object, value)}
                </div>
            </div>
        </div>`;
    }

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
    buildLabels(storageData) {
        var output = '';
        for (const label of storageData.labelData) {
            const labelInfo = storageData.labelsList.find(obj => obj.label == label);
            output += `
<div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
    Pages Labeled: ${label}
</div>`;
            if (labelInfo) {
                output += this.buildList(labelInfo.linkedPages,
                                         'gdnt-label-page',
                                         (linkPage)=>`Open: ${linkPage.display}`,
                                         (linkPage)=>`Remove '${label}' from Page: ${linkPage.display}`,
                                         (linkPage)=>`<a class="gdnt-anchor" href="${linkPage.page}">${linkPage.display}</a>`,
                                         (linkPage)=>`${label}:${linkPage.page}`);
            }
        }
        return output;
    }

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
    buildButton(id, cl, extra, containerClass) {
        return `
<div id="${id}" role="button" class="goog-inline-block jfk-button jfk-button-standard ${cl}" ${extra} data-ol-has-click-handler="">
   <div class="docs-icon goog-inline-block ">
       <div class="docs-icon-img-container ${containerClass}">
           &nbsp;
       </div>
   </div>
</div>
`;
    }

    build(storageData) {
        return `
       <div class="updating-navigation-item-list">
           <div class="updating-navigation-item-list">
               <div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;">
                   <!-- Remove Button: This is dynamically moved as mouse is moved over deletable items -->
                   <div id="gdnt-delete-item" class="gdnt-deletable gdnt-deletable-nofocus navigation-widget-row-controls" style="top: 145px; right: 23px; display: none;">
                       <div class="gdnt-deletable gdnt-deletable-nofocus navigation-widget-row-controls-control navigation-widget-row-controls-suppress goog-inline-block goog-flat-button" role="button" data-tooltip="Remove:" data-tooltip-offset="-8" id="a4jzle:16y" tabindex="0" style="user-select: none;">
                           <div class="gdnt-deletable gdnt-deletable-nofocus docs-icon goog-inline-block ">
                               <div class="gdnt-deletable gdnt-deletable-nofocus docs-icon-img-container docs-icon-img docs-icon-close-thin">
                                   &nbsp;
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       </div>
       <div class="navigation-widget-smart-summary-container-1">
           <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
               <div class="kix-smart-summary-view-header-container">
                   <div class="gdnt-notes-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-note="${storageData.noteData.note}" role="heading">
                       Notes: <div class="navigation-item-content" style="display:inline"><a class="gdnt-anchor" href="${storageData.noteData.note}">${storageData.noteData.display}</a></div>
                   </div>
                   <!-- Edit Note -->
                   ${this.buildButton('gdnt-notes-edit', 'kix-smart-summary-edit-button', 'data-tooltip="Edit Notes" style="display: none;"', 'docs-icon-img docs-icon-edit-outline')}
                   <!-- Add Note -->
                   <div id="gdnt-notes-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: none;">
                       ${this.buildButton('gdnt-notes-add1', 'kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon', '', 'docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary')}
                       ${this.buildButton('gdnt-notes-add2', 'kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon', 'style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Notes"', 'docs-icon-img docs-icon-plus')}
                   </div>
               </div>
           </div>
           <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
               <div class="kix-smart-summary-view-header-container">
                   <div class="gdnt-labels-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-labels="${storageData.noteData.note}" role="heading">
                       Labels: <div class="navigation-item-content" style="display:inline">${this.buildLabelList(storageData.labelData)}</div>
                   </div>
                   <!-- Add Label -->
                   <div id="gdnt-labels-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: block;">
                       ${this.buildButton('gdnt-label-add1', 'kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon', '', 'docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary')}
                       ${this.buildButton('gdnt-label-add2', 'kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon', 'style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Labels"', 'docs-icon-img docs-icon-plus')}
                   </div>
               </div>
           </div>
           <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
               <div id="gdnt-notes-list-of-notes" class="kix-smart-summary-view-content-container" style="display: none;">
                   <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">
                       Existing Notes Documents:
                   </div>
                   ${this.buildList(storageData.notesList, 'gdnt-note', (linkPage)=>`Add this page to Note '${linkPage.display}'`, (linkPage)=>`Delete Note: '${linkPage.display}'`, (linkPage, link)=>linkPage.display, (linkPage)=>linkPage.note)}
                   <!-- <div class="kix-smart-summary-view-separator">
                   </div> -->
               </div>
               <div id="gdnt-labels-list-of-labels" class="kix-smart-summary-view-content-container" style="display: block;">
                   <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">
                       Existing Labels :
                   </div>
                   ${this.buildList(storageData.labelsList, 'gdnt-label', (linkPage)=>`Add label ${linkPage.label} to this page`, (linkPage)=>`Delete Label: ${linkPage.label}`, (linkPage)=>linkPage.label, (linkPage)=>linkPage.label)}
                   <div class="kix-smart-summary-view-separator">
                   </div>
               </div>
           </div>
           <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
               Pages Linked to this page:
           </div>
           ${this.buildList(storageData.pageNote.linkedPages, 'gdnt-note-page', (linkPage)=>`Open: ${linkPage.display}`, (linkPage)=>`Remove Page: ${linkPage.display}`, (linkPage)=>`<a class="gdnt-anchor" href="${linkPage.page}">${linkPage.display}</a>`, (linkPage)=>linkPage.page)}
           <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
               Pages Linked to same note:
           </div>
           ${this.buildList(storageData.noteData.linkedPages, 'gdnt-note-page', (linkPage)=>`Open: ${linkPage.display}`, (linkPage)=>`Remove Page: ${linkPage.display}`, (linkPage)=>`<a class="gdnt-anchor" href="${linkPage.page}">${linkPage.display}</a>`, (linkPage)=>linkPage.page)}
           ${this.buildLabels(storageData)}
       </div>`;
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = UIBuilder;
}


