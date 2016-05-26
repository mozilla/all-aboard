(function() {
    // retrieve our button from the page
    var urlButton = document.querySelector('#urlButton');

    // add event listener for a button click on search button
    urlButton.addEventListener('click', function() {
        // alert the back-end that we've clicked the button
        addon.port.emit('highLightURL');
    });
})();
