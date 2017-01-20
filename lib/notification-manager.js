'use strict';

let _ = require('sdk/l10n').get;
let notifications = require('sdk/notifications');
let { emit, on } = require('sdk/event/core');

let { storageManager } = require('./storage-manager.js');

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
                msg = _('notification_msg_1');
                break;
            case 2:
                msg = _('notification_msg_2');
                break;
            case 3:
                msg = _('notification_msg_3');
                break;
            case 4:
                msg = _('notification_msg_4');
                break;
            default:
                return;
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
