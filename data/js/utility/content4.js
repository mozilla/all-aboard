(function() {
    // retrieve our button from the page
    var button = document.querySelector('button');
    // retrieve our next button from the sidebar
    var nextButton = document.getElementById('next-button');
    var selfPacedContent = document.getElementById('selfpaced');

    // attach click listener to next button
    attachNextButtonListener(nextButton);

    // add event listener for a button click on search button
    button.addEventListener('click', function() {
        // alert the back-end that we've clicked the button
        addon.port.emit('intent', 'highlightURL');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
        // unhide our next button
        selfPacedContent.classList.remove('hidden');
        // update aria state
        selfPacedContent.setAttribute('aria-hidden', false);
    });
})();
