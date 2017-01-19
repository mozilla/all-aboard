(function() {
    // retrieve our apple store button
    var appleStore = document.querySelector('#appleStore');
    // retrieve our play store button
    var playStore = document.querySelector('#playStore');

    // by opening this sidebar hte main cta action is
    // complete, notify add-on
    addon.port.emit('cta_complete');

    // add click listener on default theme text option
    appleStore.addEventListener('click', function(event) {
        event.preventDefault();
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'appleStore');
    });

    // add click listener on default theme text option
    playStore.addEventListener('click', function(event) {
        event.preventDefault();
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'playStore');
    });
})();
