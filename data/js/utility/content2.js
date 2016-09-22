(function() {
    // retrieve button from the page
    var button = document.querySelector('button');
    var nextButton = document.getElementById('next-button');
    var selfPacedContent = document.getElementById('selfpaced');

    // attach click listener to next button
    attachNextButtonListener(nextButton);

    // add event listeners for a button click on the button
    button.addEventListener('click', function() {
        // unhide our next button,
        selfPacedContent.classList.remove('hidden');
        // update aria state
        selfPacedContent.setAttribute('aria-hidden', false);
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'privateBrowsing');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
    });
})();
