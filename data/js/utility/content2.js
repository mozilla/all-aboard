(function() {
    // retrieve button from the page
    var pbButton = document.querySelector('#pb_button');
    var token = document.querySelector('#token2');

    // add event listeners for a button click on the button
    pbButton.addEventListener('click', function() {
    	// Leaving the below line as a comment for previewing purposes until
        // the functionality is completed without it needed
        //token.style.backgroundImage = "url('/data/media/tokens/utility/token2.svg')";

        // notify addon that we've clicked the button
        addon.port.emit('intent', 'privateBrowsing');
    });
})();