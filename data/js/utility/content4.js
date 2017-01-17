(function() {
    // retrieve our button from the page
    var button = document.querySelector('button');
    var selfPacedContent = document.getElementById('selfpaced');

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
