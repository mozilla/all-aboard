(function() {
    // retrieve button from the page
    var button = document.querySelector('button');

    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    // listen for a click on the search button
    button.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
    });
})();
