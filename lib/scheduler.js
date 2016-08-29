'use strict';

var { emit, on } = require('sdk/event/core');
var timers = require('sdk/timers');

var { intervals } = require('./intervals.js');
var { storageManager } = require('./storage-manager.js');
var { toolbarButton } = require('./toolbar-button.js');
var { utils } = require('./utils.js');

var timer;
var timersArray = [];

exports.scheduler = {
    destroyTimer: -1,
    /**
     * Closes a currently visible sidebar after the defaultSidebarCloseTime
     * @param {int} timeout - Time in milliseconds before function is executed
     */
    autoCloseTimer: function(timeout) {
        // clear all currently scheduled auto close timers
        this.clearTimers();

        var autoClose = timers.setTimeout(function() {
            if (storageManager.get('isSidebarVisible') === true) {
                emit(exports, 'hideSidebar');
            }
        }, timeout);

        // push the timer onto the timersArray
        timersArray.push(autoClose);
    },
    /**
     * Loops through timersArray and clears all timers.
     */
    clearTimers: function() {
        for (var i = 0, l = timersArray.length; i < l; i++) {
            timers.clearTimeout(timersArray[i]);
        }
    },
    /**
     * Calls toolbarButton.showBadge() after a 60 second delay.
     */
    delayedNotification() {
        timers.setTimeout(function() {
            toolbarButton.showBadge();
        }, intervals.oneMinute);
    },
    /**
     * Starts the timer based upon the afterInteractionCloseTime to destroy the addon
     */
    startDestroyTimer: function(destroyTime) {
        this.destroyTimer = timers.setTimeout(function() {
            // clear any autoCloseTimer that may be scheduled
            module.exports.scheduler.clearTimers();
            // destroys the addon
            utils.destroy();
        }, destroyTime);
    },
    /**
    * Starts a timer that will call the showBadge function after 24 hours, should the
    * user not close the browser earlier.
    * @param {int} divideBy - number to divide the wait interval by
    */
    startNotificationTimer: function(divideBy) {
        // to avoid starting multiple timers,
        // proactively clear any existing timer
        timers.clearTimeout(timer);
        // schedule a new timer
        timer = timers.setTimeout(function() {
            toolbarButton.showBadge();
        }, intervals.waitInterval / divideBy);
    }
};

exports.onSchedulerEvent = on.bind(null, exports);
