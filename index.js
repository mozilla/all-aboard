(function() {
    'use strict';

    chrome.runtime.onMessage.addListener(router);

    /**
    * Routes incomming messages based on intent.
    * @param {object} message - The message sent by the calling script.
    * @param {object} sender - An object containing information about the sender of a message.
    */
    function router(message, sender) {
        console.log(message, sender);
    }

})();
