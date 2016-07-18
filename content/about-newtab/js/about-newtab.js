'use strict';

var headDiv = document.querySelector('#newtab-search-container');
var footDiv = document.querySelector('#newtab-margin-bottom');

function showUserData(headerContent, footerContent) {
    // if we have header content, display it
    if (headerContent) {
        headDiv.insertAdjacentHTML('beforebegin', headerContent);

        var history = document.querySelector('#history');
        var bookmarks = document.querySelector('#bookmarks');

        history.addEventListener('click', function() {
            self.port.emit('intent', 'showAwesomebar');
        });

        bookmarks.addEventListener('click', function() {
            self.port.emit('intent', 'showBookmarks');
        });

        // As soon as the script loads and modifys the page, emit a message back to our sidebar that we've loaded the page
        self.port.emit('pageModified');
    }
    // if we have footer content, display it
    if (footerContent) {
        footDiv.insertAdjacentHTML('beforebegin', footerContent);

        var undoMigrate = document.querySelector('#undo-migrate');

        undoMigrate.addEventListener('click', function() {
            self.port.emit('intent', 'undoMigrate');
        });
    }
}

// listen for the modify event emitted from the add-on, and only then,
// start execution of the code.
self.port.on('modify', function(headerContent, footerContent) {
    // try to grab the stuff we're going to insert into the page
    var autoImportHeader = document.querySelector('.allaboard-auto-import');
    // if it isn't inserted already, call the function to insert it
    if (autoImportHeader === null) {
        showUserData(headerContent, footerContent);
    }
});
