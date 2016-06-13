'use strict';

var defaultSnippetContainer = document.querySelector('#snippetContainer');
var searchIconAndTextContainer = document.querySelector('#searchIconAndTextContainer');

/**
 * Load and injects the snipet for the current cotent step
 * @param {string} snippetContent - The content to inject
 */
function showSnippet(snippetContent) {
    var button;
    var addonSnippet = document.querySelector('#allaboard_snippet');

    // if a previous snippet added by the addon exists, remove it.
    if (addonSnippet) {
        addonSnippet.remove();
    }

    searchIconAndTextContainer.insertAdjacentHTML('afterend', snippetContent);

    button = document.querySelector('#allaboard_anippet_intent');
    button.addEventListener('click', function() {
        if (typeof button.dataset !== 'undefined') {
            // pass the button intent to the add-on
            self.port.emit('intent', button.dataset['intent']);
        }
    });
}

// listen for the modify event emitted from the add-on, and only then,
// start executiion of the code.
self.port.on('modify', function(snippetContent) {
    // see whether a default snippet container exists
    if (defaultSnippetContainer) {
        defaultSnippetContainer.style.display = 'none';
        showSnippet(snippetContent);
    }
});
