(function() {
    // retrieve our apple store button
    let appleStore = document.querySelector('#appleStore');
    // get the tips copy element
    let tipsCopy = document.getElementById('tips-copy');
    // retrieve our play store button
    let playStore = document.querySelector('#playStore');

    // by opening this sidebar hte main cta action is
    // complete, notify add-on
    addon.port.emit('cta_complete');
    // show info copy
    tipsCopy.classList.remove('hide');
    tipsCopy.setAttribute('aria-hidden', false);

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
