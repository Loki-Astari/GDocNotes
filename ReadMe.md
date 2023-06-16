## Intro:

Two things to note:

1. I am C++ engineer not Java (so be kind).
2. I am back-end mostly but here is some front-end stuff.
   I will take any hints on how to make the UI better (currently its functional).

### Google Docs Note Taker.

Purpose: I find google docs hard to organize in google drive (it takes more effort than it should).

So I started creating a "note" documents. A "note" document has links to all documents related to a particular subject and some notes about the combined documents.

Note: Note all the documents are mine so I can't just modify the original documents (hence the separate notes document).

The other day I though I could automate some of this processes with a tampermonkey script. It has now evolved past that to a chrome extension. With some rudimentary Unit-Tests. Once I had the basic script for the notes document working it became easy to add the concept of "labels". So you can now add multiple labels to a document.

### What it does:

The script adds a section <div id="GDNTNotesContainer"> to the left bar of a google doc page.

This div contains two sections:

#### Notes Section:

This section shows if a note document has been linked and a list of labels that have been applied to the document. To the right of these are "+" icons that allow you to manually add a note document or a label. For convenience below this are a list of known labels (labels you have applied to other documents) and if there is no linked note document a list of known note documents (note documents that have been linked to other documents). These are for convenience to allow you to quickly add known labels / note documents to this document.

#### Link Section:

This section lists all linked documents. If this is a note document it will list all documents linked to this document. If this document has a linked note document it will list all documents linked to the note. For each label applied to this document it will list the label and all documents with the same label.



#### Instructions on Usage:

Note: The left side bar is usually hidden. So by default you will not see the new sections. To see them open the left side bar by clicking on the "Note" icon in the top left corner of the document window.


When you first start you have no linked notes documents. So the left bar has "Notes:" and "Labels:" section with a "+" icon to the right of each. Pressing the "+" pops up a dialog asking for a link to notes document (no checking is done that it is a link (so you can add any string here) or a label. For the note I recommend adding a link to a google document, for the labels feel free to add appropriate labels to the document.

Once you have added a linked a notes document you should the interface change to show the linked document (the icon changes to an edit button) and the labels section contains a list of lables attached to the document. The "Link" section will also update to show this pages in each of the sections as appropriate.


