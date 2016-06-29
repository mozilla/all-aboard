'use strict';

var headDiv = document.querySelector('#newtab-search-container');
var footDiv = document.querySelector('#newtab-margin-bottom');
var undoMigrate = document.querySelector('#undo-migrate');

function showUserData(headerContent, footerContent) {
    headDiv.insertAdjacentHTML('beforebegin', headerContent);
    footDiv.insertAdjacentHTML('beforebegin', footerContent);
}

// listen for the modify event emitted from the add-on, and only then,
// start execution of the code.
self.port.on('modify', function(headerContent, footerContent) {
    showUserData(headerContent, footerContent);
});

undoMigrate.addEventListener('click', function() {
    addon.port.emit('undoMigrate');
});
