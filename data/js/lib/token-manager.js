(function() {
    'use strict';

    function bindClickListeners() {
        var tokenTriggers = document.querySelectorAll('li.active input');
        var tokensLength = tokenTriggers.length;

        // using let to avoid scope problems inside the loop
        // http://bit.ly/296Q9Dz
        for (let i = 0; i < tokensLength; i++) {
            let currentTrigger = tokenTriggers[i];
            currentTrigger.addEventListener('click', function() {
                addon.port.emit('loadSidebar', {
                    step: currentTrigger.dataset['step'],
                    track: currentTrigger.dataset['track']
                });
            });
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

    // only show the token awarded message if the below event is received.
    addon.port.on('showTokenMsg', function() {

        var tokenAwarded = document.querySelector('.token-awarded');
        // show the token awarded message
        tokenAwarded.classList.remove('hidden');
        tokenAwarded.setAttribute('aria-hidden', false);
    });

})();
