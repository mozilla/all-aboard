(function() {
    'use strict';

    // listens for a tokens event from the add-on and enables tokens
    // that has been received by the user.
    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

})();
