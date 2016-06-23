(function() {
    // retrieve our default text from the sidebar
    var defaultText = document.querySelector('#default');
    // set template names
    var templateNames = ['template1','template2','template3'];

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
            });
        })(templateNames[x]);
    }

    // add click listener on default theme text option
    defaultText.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'defaultTemplate');
    });
})();
