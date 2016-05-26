(function() {
    // retrieve button from the page
    var searchButton = document.querySelector('#search_button');
    var token1 = document.querySelector('#token1');
    
    // listen for a click on the search button
    searchButton.addEventListener('click', function() {
        // Leaving the below line as a comment for previewing purposes until
        // the functionality is completed without it needed
        token1.style.backgroundImage = "url('/data/media/tokens/utility/token1.svg')";
        
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'search');
    });
})();
