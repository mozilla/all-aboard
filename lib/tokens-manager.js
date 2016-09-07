'use strict';

var { storageManager } = require('./storage-manager.js');

exports.tokensManager = {
    // whether we have assigned a token for our current content step
    assignedToken: false,
    /**
    * Manages tokens and emits a message to the sidebar with an array
    * of tokens the user has received
    * @param {int} step - the step to assign a token for
    * @param {object} worker - used to emit the tokens array to the sidebar
    */
    assignTokens: function(step, worker) {
        let tokens = storageManager.get('tokens') || [];
        let token = 'token' + step;
        // flag that we have assigned our token for this sidebar so we can check later
        this.assignedToken = true;

        // if the token is not currently in the array, add it
        if (tokens.indexOf(token) === -1) {
            tokens.push(token);
            // store the new token
            storageManager.set('tokens', tokens);
        }
        // emit the array of tokens to the sidebar
        worker.port.emit('tokens', tokens);
        // show the success message.
        worker.port.emit('showTokenMsg');
    }
};
