(function() {
    // retrieve button from the page
    var button = document.querySelector('button');
    var nextButton = document.querySelector('.next-button');
    var nextToken = document.querySelector('#token2');

    // listen for a click on the search button
    button.addEventListener('click', function() {
        // if this is the furtherst sidebar the user has achieved (the next token hasn't been awarded)
        if (!nextToken.classList.contains('active')) {
            // unhide our next button, 
            nextButton.classList.remove('hidden');
        }

        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
    });

    nextButton.addEventListener('click', function() {
        // notify addon that we've clicked the next button
        addon.port.emit('next_selected');
    });
})();
