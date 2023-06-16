/*
 * This simply creates the object
 */

    const storage = new Storage();
    const uiBuilder = new UIBuilder();
    const ui = new UI(storage, uiBuilder, Util.cleanUrl(window.location.href));

    // Wait for particular DOM elements to exist before starting up my code.
    // Basically the google docs page has to execute some code to add the different parts of the document.
    // This waits until those parts of the document exist then adds this UI into the middle of that.

    waitForKeyElements('div.left-sidebar-container div.navigation-widget-smart-summary-container', () => {ui.createUI();});

