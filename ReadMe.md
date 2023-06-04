## Intro:

Two things to note:

1. I am C++ engineer not Java (so be kind).
2. I am backend mostly but here is some frontend stuff.   
   I will take any hints on how to make the UI better (currently its functional).

### Google Docs Note Taker.

Purpose: I find google docs hard to organize in google drive (it takes more effort than it should).

So I started created "note" documents. A "note" document has links to all documents related to a particular subject and some notes about the combined documents. Note: Note all the documents are mine so I can just modify the original documents (hence the separate notes document).

The other day I though I could automate some of this processes with a tampermonkey script. The script adds a section <div id="GDNTNotesContainer"> to the left bar of a google doc page with information and links there.

#### Instructions on Usage:
When you first start you have no linked notes documents. So the left bar has "Add Note" button. Pressing this pops up a dialog asking for a link to notes document (no checking is done that it is a link. At the moment I am thinking this is a feature as I can use this to create associateions without an actual notes document, but that part needs work so please just test using notes documents, i'll work on more uses later).

Once you have a linked a notes document you should the interface change to have two things: 1) An "Open Notes:" button whick opens the notes document, 2) A list of pages that also use the same notes document (Currently just this document).

If you now go to another google document (another that has not been linked) you will see the "Add Note" button but also the previous note document you just added. So you can easily associate other pages with known notes documents without looking them up.

