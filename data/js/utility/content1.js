(function() {
    // retrieve button from the page
    var button = document.querySelector('button');
    var nextButton = document.getElementById('next-button');
    var nextToken = document.querySelector('#token2');
    var selfPacedContent = document.getElementById('selfpaced');

    // attach click listener to next button
    nextButton = attachNextButtonListener(nextButton);

    // listen for a click on the search button
    button.addEventListener('click', function() {
        // if this is the furtherst sidebar the user has achieved (the next token hasn't been awarded)
        if (!nextToken.classList.contains('active')) {
            // unhide our next button,
            selfPacedContent.classList.remove('hidden');
            // update aria state
            selfPacedContent.setAttribute('aria-hidden', false);
        }

        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
    });
})();
