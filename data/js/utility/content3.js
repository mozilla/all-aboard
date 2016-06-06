(function() {
    // retrieve our default text from the sidebar
    var defaultText = document.querySelector('#default');
    // set template names
    var templateNames = ['template1','template2','template3'];

    // add the correct number of tokens to our sidebar
    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    // add listeners to all of our buttons for clicking
    for(var x=0; x<templateNames.length; x++)
    {
        // get the current template
        var node = document.querySelector('#' + templateNames[x]);

        // rescope our port emit text locally to access in the eventlistener
        (function(name) {
            node.addEventListener('click', function() {
                // notify addon that we've clicked the button
                addon.port.emit('intent', name);
            });
        })(templateNames[x]);
    }

    // add click listener on default theme text option
    defaultText.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'defaultTemplate');
    });
})();