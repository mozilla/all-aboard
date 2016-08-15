(function() {
    // retrieve our button from the page
    var button = document.querySelector('button');
    // retrieve our next button from the sidebar
    var nextButton = document.querySelector('.next-button');

    // add event listener for a button click on search button
    button.addEventListener('click', function() {
        // alert the back-end that we've clicked the button
        addon.port.emit('intent', 'highlightURL');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
        
        // unhide our next button
        nextButton.classList.remove('hidden');
    });

    nextButton.addEventListener('click', function() {
        // notify addon that we've clicked the next button
        addon.port.emit('next_selected');
    });
})();
