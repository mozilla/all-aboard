(function() {
    'use strict';

    function bindClickListeners() {
        var tokenTriggers = document.querySelectorAll('.token-trigger');

        // using let to avoid scope problems inside the loop
        // http://bit.ly/296Q9Dz
        for (let i = 0, l = tokenTriggers.length; i < l; i++) {
            let currentTrigger = tokenTriggers[i];
            // only add event listeners to elements that are visible
            if (window.getComputedStyle(currentTrigger).display !== 'none') {
                currentTrigger.addEventListener('click', function() {
                    addon.port.emit('show', {
                        step: currentTrigger.dataset['step'],
                        track: currentTrigger.dataset['track']
                    });
                });
            }
        }
    }

    // listens for a tokens event from the add-on and enables tokens
    // that has been received by the user.
    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
        // all active tokens shown, bind events
        bindClickListeners();
    });

})();
