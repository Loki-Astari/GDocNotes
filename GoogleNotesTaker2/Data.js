/*
PageInfo:
    url:        <string>        => Key
    display:    <string>
    noteUrl:    <string>        => Foreign Key
    labels:     [<string>]
    linkedPages:[<string>]

LabelInfo:
    label:      <string>        => Key
    linkedPages:[<string>]

DataImpl:
    version:    <integer>
    pages:      [<PageInfo>]
    labels:     [<LabelInfo>]

    page:       <string>
    data:       <Data>

Data:
    data:       DataImpl

    getDisplay(page)
    getUrl(page)
    getLinkedPages(page)
    getLabels(page)

    hasNote(page)
    getNoteUrl(page)
    getNoteDisplay(page)
    getNoteLinkedPages(page)

    getLabelPages(label)

    setNote(page, note)
    addLabel(page, label)
    delLabel(page, label)
*/

class PageInfo {
    url;
    display;
    noteUrl;
    labels;
    linkedPages;

    constructor(url) {
    }
    :xa
};

