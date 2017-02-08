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

    // listen for a click on the search button
    button.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
        showTipsCopy();
    });
})();
