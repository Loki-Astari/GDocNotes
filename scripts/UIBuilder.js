class UIBuilder {

    constructor() {
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
    buildLabelList(iterator) {
        var output = '';
        for (const label of iterator) {
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
    buildListElement(iterator, cl, actiontt, deletett, object, value) {
        var output = '';
        for (const linkPage of iterator) {
            output += `
<div class="gdnt-deletable last_child_override navigation-item ${cl}" role="menuitem" style="user-select: none;" data-deletable-tt="${deletett(linkPage)}" value="${value(linkPage)}" style="padding-right: 8px; margin-bottom: 0px;">
    <div class="gdnt-deletable gdnt-deletable-inner navigation-item-content navigation-item-level-1" data-tooltip="${actiontt(linkPage)}" data-tooltip-align="r,c" data-tooltip-only-on-overflow="true" data-tooltip-offset="-8">${object(linkPage)}</div>
</div>`;
        }
        return output;
    }

    buildList(iterator, cl, actiontt, deletett, object, value) {
        return `
        <div class="updating-navigation-item-list">
            <div class="updating-navigation-item-list">
                <div class="navigation-item-list goog-container" tabindex="0" style="user-select: none; padding-right: 15px;">
                    ${this.buildListElement(iterator, cl, actiontt, deletett, object, value)}
                </div>
            </div>
        </div>`;
    }

    // See Data.js
    buildLabels(data, page) {
        var output = '';
        if (page) {
            const pageData = data.getPage(page);
            for (const label of pageData.labels) {
                const labelInfo = data.getLabel(label);
                output += `
<div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
    Pages Labeled: ${label}
</div>`;
                    output += this.buildList(labelInfo,
                                             'gdnt-label-page',
                                             (page)=>`Open: ${data.getPage(page).display}`,
                                             (page)=>`Remove '${label}' from Page: ${data.getPage(page).display}`,
                                             (page)=>`<a class="gdnt-anchor" href="${data.getPage(page).url}">${data.getPage(page).display}</a>`,
                                             (page)=>`${label}:${data.getPage(page).url}`);
            }
        }
        if (output == '') {
            output += `
<div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
    No Labels on this page.
</div>`;
        }
        return output;
    }

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

    // See Data.js
    build(data, page) {
        const pageData = data.getPage(page);
        const noteData = pageData.noteUrl == '' ? {url: '', display: '', noteUrl: '', labels: [], linkedPages: []} : data.getPage(pageData.noteUrl);
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
                   <div class="gdnt-notes-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-note="${noteData.url}" role="heading">
                       Notes: <div class="navigation-item-content" style="display:inline"><a class="gdnt-anchor" href="${noteData.url}">${noteData.display}</a></div>
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
                   <div class="gdnt-labels-clickable kix-smart-summary-view-header navigation-widget-header" id="kix-smart-summary-view-header" gdnt-labels="${noteData.url}" role="heading">
                       Labels: <div class="navigation-item-content" style="display:inline">${this.buildLabelList(pageData.labels)}</div>
                   </div>
                   <!-- Add Label -->
                   <div id="gdnt-labels-add" class="kix-smart-summary-entrypoint-container kix-smart-summary-header-button" style="display: block;">
                       ${this.buildButton('gdnt-label-add1', 'kix-smart-summary-add-button-promo kix-smart-summary-entrypoint-icon', '', 'docs-smart-summary-tinted docs-icon-img docs-icon-smart-summary')}
                       ${this.buildButton('gdnt-label-add2', 'kix-smart-summary-add-button-default kix-smart-summary-entrypoint-icon', 'style="position: relative;" tabindex="0" data-tooltip-class="kix-default-tooltip" data-tooltip-offset="0" data-tooltip="Add Labels"', 'docs-icon-img docs-icon-plus')}
                   </div>
               </div>
           </div>
           <div class="docs-material kix-smart-summary-view" style="padding-bottom:0px">
               <div id="gdnt-notes-list-of-notes" class="kix-smart-summary-view-content-container gdnt-compress" style="display: none;">
                   <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">
                       Existing Notes Documents:
                   </div>
                   ${this.buildList(data.notes, 'gdnt-note', (page)=>`Add this page to Note '${data.getPage(page).display}'`, (page)=>`Delete Note: '${data.getPage(page).display}'`, (page)=>data.getPage(page).display, (page)=>data.getPage(page).url)}
                   <!-- <div class="kix-smart-summary-view-separator">
                   </div> -->
               </div>
               <div id="gdnt-labels-list-of-labels" class="kix-smart-summary-view-content-container gdnt-compress" style="display: block;">
                   <div class="navigation-widget-header navigation-widget-outline-header" style="padding:0;" role="heading">
                       Existing Labels :
                   </div>
                   ${this.buildList(data.labels, 'gdnt-label', (label)=>`Add label ${label} to this page`, (label)=>`Delete Label: ${label}`, (label)=>label, (label)=>label)}
                   <div class="kix-smart-summary-view-separator">
                   </div>
               </div>
           </div>
           <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
               Pages Linked to this page:
           </div>
           ${this.buildList(pageData.linkedPages, 'gdnt-note-page', (page)=>`Open: ${data.getPage(page).display}`, (page)=>`Remove Page: ${data.getPage(page).display}`, (page)=>`<a class="gdnt-anchor" href="${data.getPage(page).url}">${data.getPage(page).display}</a>`, (page)=>data.getPage(page).url)}
           <div class="navigation-widget-header navigation-widget-outline-header" style="padding-bottom:0px" role="heading">
               Pages Linked to same note:
           </div>
           ${this.buildList(noteData.linkedPages, 'gdnt-note-page', (page)=>`Open: ${data.getPage(page).display}`, (page)=>`Remove Page: ${data.getPage(page).display}`, (page)=>`<a class="gdnt-anchor" href="${data.getPage(page).url}">${data.getPage(page).display}</a>`, (page)=>data.getPage(page).url)}
           ${this.buildLabels(data, page)}
       </div>`;
    }
}

if (typeof process !== 'undefined' && process.env['NODE_DEV'] == 'TEST') {
    module.exports = UIBuilder;
}


