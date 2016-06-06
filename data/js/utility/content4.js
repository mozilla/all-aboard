(function() {
    // retrieve our button from the page
    var button = document.querySelector('button');

    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    // add event listener for a button click on search button
    button.addEventListener('click', function() {
        // alert the back-end that we've clicked the button
        addon.port.emit('intent', 'highlightURL');
    });
})();
