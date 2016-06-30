'use strict';

var headDiv = document.querySelector('#newtab-search-container');
var footDiv = document.querySelector('#newtab-margin-bottom');

function showUserData(headerContent, footerContent) {
    headDiv.insertAdjacentHTML('beforebegin', headerContent);
    footDiv.insertAdjacentHTML('beforebegin', footerContent);

    var history = document.querySelector('#history');
    var bookmarks = document.querySelector('#bookmarks');
    /* staging for auto migrate
    var undoMigrate = document.querySelector('#undo-migrate');
    undoMigrate.addEventListener('click', function() {
        addon.port.emit('intent', 'undoMigrate');
    });*/

    history.addEventListener('click', function() {
        self.port.emit('intent', 'showAwesomebar');
    });

    bookmarks.addEventListener('click', function() {
        self.port.emit('intent', 'showBookmarks');
    });
}

// listen for the modify event emitted from the add-on, and only then,
// start execution of the code.
self.port.on('modify', function(headerContent, footerContent) {
    showUserData(headerContent, footerContent);

});

// listen for the remove footer event
self.port.on('removeFooter', function() {
    // we can only grab this after it is added to the page, which it should anytime removeFooter is emitted
    var footer = document.querySelector('#footer');
    // hide the footer content
    footer.style.visibility = "hidden";
});