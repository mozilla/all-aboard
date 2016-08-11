'use strict';

var notifications = require('sdk/notifications');
var { emit, on } = require('sdk/event/core');

var { storageManager } = require('./storage-manager.js');

/**
 * A class that manages all notifications during the lifecycle of the add-on
 */
exports.notificationsManager = {
    /**
    * Shows a transient desktop notification to the user when new sidebar
    * content is available. If the notification is clicked, the new sidebar is shown
    * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK/High-Level_APIs/notifications
    */
    showDesktopNotification: function() {
        notifications.notify({
            title: 'Firefox',
            text: 'You have 1 new notification.',
            iconURL: './media/icons/icon-32_active.png',
            onClick: function() {
                emit(exports, 'toggleSidebar');
            }
        });

        // note that we have shown our notification so we don't try showing it again
        storageManager.set('shownNotification', true);
    }
};

exports.on = on.bind(null, exports);
