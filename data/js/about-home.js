'use strict';

var defaultSnippetContainer = document.querySelector('#snippetContainer');
var searchIconAndTextContainer = document.querySelector('#searchIconAndTextContainer');

/**
 * Load and injects the snipet for the current cotent step
 * @param {string} snippetContent - The content to inject
 */
function showSnippet(snippetContent) {
    var addonSnippet = document.querySelector('#allaboard_snippet');
    var button;

    // if a previous snippet added by the addon exists, remove it.
    if (addonSnippet) {
        addonSnippet.remove();
    }

    searchIconAndTextContainer.insertAdjacentHTML('afterend', snippetContent);

    // get the new snippet container
    addonSnippet = document.querySelector('#allaboard_snippet');
    // force redraw of the snippet container
    addonSnippet.style.display = 'none';
    addonSnippet.style.display = 'block';

    button = document.querySelector('#allaboard_snippet_intent');

    button.addEventListener('click', function() {
        // pass the button intent to the add-on
        self.port.emit('showSidebar', {
            step: button.dataset.step,
            track: button.dataset.track,
            aboutHome: true
        });
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
