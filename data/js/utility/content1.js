(function() {
    // retrieve button from the page
    var searchButton = document.querySelector('#search_button');
    
    // add our tokens to the sidebar
    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    // listen for a click on the search button
    searchButton.addEventListener('click', function() {        
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
    });
})();
