'use strict';

var buttons = require('sdk/ui/button/action');
var { emit, on } = require('sdk/event/core');

var { notificationsManager } = require('./notification-manager.js');
var { once } = require('./utils.js');

exports.toolbarButton = {
    allAboard: undefined,
    /**
     * Clears the badge and changes the icon back to a non-active state
     */
    resetState: function() {
        this.allAboard.state('window', {
            badge: null,
            icon: {
                '16': './media/icons/icon-16.png',
                '32': './media/icons/icon-32.png',
                '64': './media/icons/icon-64.png'
            }
        });
    },
    /**
    * Updates the add-on icon by adding a badge, inicating that there is new content.
    * This will also cause the desktop notification to be shown.
    */
    showBadge: function() {
        this.allAboard.state('window', {
            badge: '1',
            badgeColor: '#5F9B0A',
            label: '1 new notification.',
            icon: {
                '16': './media/icons/icon-16_active.png',
                '32': './media/icons/icon-32_active.png',
                '64': './media/icons/icon-64_active.png'
            }
        });

        notificationsManager.showDesktopNotification();
    },
    /**
     * Stops pagemod from making more modifications on firstrun in the future,
     * and disables its further use
     */
    destroy: function() {
        if (this.allAboard) {
            this.allAboard.destroy();
        }
    },
    /**
     * Adds the add-on ActionButton to the Firefox browser chrome
     */
    addAddOnButton: function() {
        // if the action button does not already exist
        if (typeof allAboard === 'undefined') {
            // Create the action button, this will add the add-on to the chrome
            this.allAboard = buttons.ActionButton({
                id: 'all-aboard',
                label: 'Firefox Notifications',
                icon: {
                    '16': './media/icons/icon-16.png',
                    '32': './media/icons/icon-32.png',
                    '64': './media/icons/icon-64.png'
                },
                onClick: function() {
                    module.exports.toolbarButton.resetState();
                    emit(exports, 'toggleSidebar');
                }
            });

            // listens for the destroy event emitted by utils
            once('intent', function(intent) {
                if (intent === 'destroy') {
                    module.exports.toolbarButton.destroy();
                }
            });
        }
    }
};

exports.onToolbarButtonEvent = on.bind(null, exports);
