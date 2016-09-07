'use strict';

var notifications = require('sdk/notifications');
var { emit, on } = require('sdk/event/core');

var { storageManager } = require('./storage-manager.js');

/**
 * A class that manages all notifications during the lifecycle of the add-on
 */
exports.notificationsManager = {
    /**
     * Returns the relevant message for the specified step
     * @param {int} step - The step to get the msg for
     * @returns msg - The message as a string
     */
    getSidebarMessage: function(step) {
        let msg = '';

        switch(step) {
            case 1:
                msg = 'Earn stars. Get a gift. Check it out.';
                break;
            case 2:
                msg = 'Four stars stand between you and your gift. Click here.';
                break;
            case 3:
                msg = 'Reach the trophy. Get your gift. Check it out.';
                break;
            case 4:
                msg = 'Two more stars. Almost there. Click here.';
                break;
            case 5:
                msg = 'Almost done! Your gift awaits. Check it out.';
                break;
            default:
                msg = 'Claim your prize! Click here now.';
        }
        return msg;
    },
    /**
    * Shows a transient desktop notification to the user when new sidebar
    * content is available. If the notification is clicked, the new sidebar is shown
    * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK/High-Level_APIs/notifications
    */
    showDesktopNotification: function() {
        let currentStep = storageManager.get('step');
        // if this is the first step, automatically show the
        // sidebar on notification
        if (currentStep === 1) {
            emit(exports, 'toggleSidebar');
            // resets the state of the action button
            emit(exports, 'resetState');
        }

        notifications.notify({
            title: 'Firefox',
            text: module.exports.notificationsManager.getSidebarMessage(currentStep),
            iconURL: './media/icons/icon-32_active.png',
            onClick: function() {
                emit(exports, 'toggleSidebar');
                // resets the state of the action button
                emit(exports, 'resetState');
            }
        });

        // note that we have shown our notification so we don't try showing it again
        storageManager.set('shownNotification', true);
    }
};

exports.onNotificationEvent = on.bind(null, exports);
