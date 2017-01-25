(function() {
    'use strict';

    function bindClickListeners() {
        let tokenTriggers = document.querySelectorAll('li.active input');
        let tokensLength = tokenTriggers.length;

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
        const activeImgPath = '/data/media/icons/progress/star_active.svg';

        let tokensLength = tokens.length;

        for (let i = 0; i < tokensLength; i++) {
            let currentToken = document.getElementById(tokens[i]);
            // set the token container to active
            currentToken.classList.add('active');
            // update the source to the active state
            currentToken.querySelector('input').src = activeImgPath;
        }
        // all active tokens shown, bind events
        bindClickListeners();
    });
})();
