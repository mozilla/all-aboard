(function() {
    // retrieve button from the page
    var button = document.querySelector('button');

    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    // add event listeners for a button click on the button
    button.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'privateBrowsing');
    });
})();
