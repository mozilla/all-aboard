(function() {
    // retrieve our default text from the sidebar
    var defaultText = document.querySelector('#default');
    // retrieve our explore themes link from the sidebar
    var exploreThemes = document.querySelector('#exploreThemes');
    // set template names
    var templateNames = ['template1'];
    var selfPacedContent = document.getElementById('selfpaced');

    // add listeners to all of our buttons for clicking
    for(var x=0, l=templateNames.length; x<l; x++) {
        // get the current template
        var node = document.querySelector('#' + templateNames[x]);

        // rescope our port emit text locally to access in the eventlistener
        (function(name) {
            node.addEventListener('click', function() {
                // notify addon that we've clicked the button
                addon.port.emit('intent', name);
                // main cta action complete, notify add-on
                // the add-on handles duplicates so, calling this multiple
                // times is fine.
                addon.port.emit('cta_complete');
                // unhide our next button
                selfPacedContent.classList.remove('hidden');
                // update aria state
                selfPacedContent.setAttribute('aria-hidden', false);
            });
        })(templateNames[x]);
    }

    // add click listener on default theme text option
    exploreThemes.addEventListener('click', function(event) {
        event.preventDefault();
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'exploreThemes');
    });

    // add click listener on default theme text option
    defaultText.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'defaultTemplate');
    });
})();
