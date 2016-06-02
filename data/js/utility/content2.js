(function() {
    // retrieve button from the page
    var pbButton = document.querySelector('#pb_button');
    
    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    // add event listeners for a button click on the button
    pbButton.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'privateBrowsing');
    });
})();