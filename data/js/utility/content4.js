(function() {
    // retrieve button from the page
    var button = document.querySelector('button');

    // add event listeners for a button click on the button
    button.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'tryAddons');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
    });
})();
