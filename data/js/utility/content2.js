(function() {
    // retrieve button from the page
    var button = document.querySelector('button');

    /**
     * Shows the tips copy below the progression bar when
     * main CTA is completed.
     */
    function showTipsCopy() {
        let tipsCopy = document.getElementById('tips-copy');
        tipsCopy.classList.remove('hide');
        tipsCopy.setAttribute('aria-hidden', false);
    }

    // add event listeners for a button click on the button
    button.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'privateBrowsing');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
        showTipsCopy();
    });
})();
