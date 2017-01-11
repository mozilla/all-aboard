'use strict';

var headDiv = document.querySelector('#newtab-search-container');
var footDiv = document.querySelector('#newtab-margin-bottom');

function showUserData(templates, showFooter) {
    headDiv.insertAdjacentHTML('beforebegin', templates.header);

    var history = document.querySelector('#history');
    var bookmarks = document.querySelector('#bookmarks');

    history.addEventListener('click', function() {
        self.port.emit('intent', 'showAwesomebar');
    });

    bookmarks.addEventListener('click', function() {
        self.port.emit('intent', 'showBookmarks');
    });

    // As soon as the script loads and modifys the page, emit a message back to our
    // sidebar that we've loaded the page
    self.port.emit('pageModified');

    // if we have footer content, display it
    if (showFooter) {
        footDiv.insertAdjacentHTML('beforebegin', templates.footer);

        var undoMigrate = document.querySelector('#undo-migrate');

        undoMigrate.addEventListener('click', function() {
            self.port.emit('intent', 'undoMigrate');
        });
    }
}

// listen for the modify event emitted from the add-on, and only then,
// start execution of the code.
self.port.on('modify', function(templates, showFooter) {
    // try to grab the stuff we're going to insert into the page
    var autoImportHeader = document.querySelector('.allaboard-auto-import');
    // if it isn't inserted already, call the function to insert it
    if (autoImportHeader === null) {
        showUserData(templates, showFooter);
    }
});
