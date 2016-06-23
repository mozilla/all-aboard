(function() {
    // retrieve button from the page
    var button = document.querySelector('button');

    // listen for a click on the search button
    button.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
    });
})();
