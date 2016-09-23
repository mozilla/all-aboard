'use strict';

var { emit, on } = require('sdk/event/core');
var timers = require('sdk/timers');

var { intervals } = require('./intervals.js');
var { storageManager } = require('./storage-manager.js');
var { toolbarButton } = require('./toolbar-button.js');
var { utils } = require('./utils.js');

var { aboutHome } = require('lib/content-scripts/about-home.js');

var destroyTimer;
var timer;
var timersArray = [];

exports.scheduler = {
    /**
     * Closes a currently visible sidebar after the defaultSidebarCloseTime
     */
    autoCloseTimer: function() {
        // clear all currently scheduled auto close timers
        this.clearTimers();

        var autoClose = timers.setTimeout(function() {
            if (storageManager.get('isSidebarVisible') === true) {
                emit(exports, 'hideSidebar');
            }
        }, intervals.defaultSidebarCloseTime);

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
     * If a notification timer is currently scheduled, clear it.
     * We cannot bundle all of the timers together so, we need this
     * specialized function.
     */
    clearNotificationTimer: function() {
        if (timer) {
            timers.clearTimeout(timer);
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
    startDestroyTimer: function() {
        // clear any previously scheduled destroyTimer
        timers.clearTimeout(destroyTimer);
        // schedule a new destroy timer
        destroyTimer = timers.setTimeout(function() {
            // clear any autoCloseTimer that may be scheduled
            module.exports.scheduler.clearTimers();
            // clear any scheduled notifications
            module.exports.scheduler.clearNotificationTimer();
            // destroys the addon
            utils.destroy();
        }, intervals.nonuseDestroyTime);
    },
    /**
     * Starts timers common among sidebars
     */
    startSidebarTimers: function() {
        // start a new 3 week destroy timer
        module.exports.scheduler.startDestroyTimer();
        // start the auto close timer
        module.exports.scheduler.autoCloseTimer();
    },
    /**
     * Schedules the next notification based on our current step.
     */
    scheduleNextNotification: function() {
        let step = storageManager.get('step');

        // clear any currently scheduled notification timer
        module.exports.scheduler.clearNotificationTimer();

        // only schedule a timer if we have not
        // reached the final content item.
        if (step < 5) {
            // update the lastSidebarCTACompleteTime to now
            storageManager.set('lastSidebarCTACompleteTime', Date.now());
            // note that we haven't yet shown our notification for this sidebar
            storageManager.set('shownNotification', false);
            // start notification timer
            module.exports.scheduler.startNotificationTimer(1);
        } else if (step === 5) {
            // update the lastSidebarCTACompleteTime to now
            storageManager.set('lastSidebarCTACompleteTime', Date.now());
            // note that we haven't yet shown our notification for this sidebar
            storageManager.set('shownNotification', false);
            module.exports.scheduler.startNotificationTimer(12);

            // note that we can now show the reward sidebar because
            // the 5th sidebar has been completed
            storageManager.set('step', 'reward');

            // add the reward snippets
            aboutHome.modifyAboutHome({
                track: 'reward'
            });
        }
    },
    /**
     * Set or update the notification status object
     * @param {object} notificationsStatus - The current notificationsStatus
     */
    setNotificationStatus: function(notificationsStatus) {
        let count = 1;

        // if there was a previous notification, use notificationsStatus.count
        // else default to 1 as set above
        if (notificationsStatus && notificationsStatus.count < 3) {
            count = notificationsStatus.count;
        }

        storageManager.set('notificationsStatus', {
            notificationTime: Date.now(),
            count: count + 1
        });
    },
    /**
     * Sets the next step for the sidebar based on our current state.
     */
    setProgress: function() {
        let currentStep = storageManager.get('step');

        // If this is step one or, the previous step has been completed, but we have not
        // moved to the reward step, move forward.
        if ((typeof currentStep === 'undefined' || (storageManager.get('ctaComplete'))
            && currentStep !== 'reward')) {
            emit(exports, 'incrementStep');
        }
    },
    /**
    * Starts a timer that will call the showBadge function after the elapsed wait time,
    * should the user not close the browser earlier.
    * @param {int} divideBy - number to divide the default wait interval by
    */
    startNotificationTimer: function(divideBy) {
        // to avoid starting multiple timers,
        // proactively clear any existing timer
        module.exports.scheduler.clearNotificationTimer();

        timer = timers.setTimeout(function() {
            let notificationsStatus = storageManager.get('notificationsStatus');
            // if notificationsStatus is undefined, meaning this is out first notification
            // for the current sidebar or, we have shown less than three notifications,
            // schedule another notification
            if (typeof notificationsStatus === 'undefined' || notificationsStatus.count < 3) {
                // update the notifications status
                module.exports.scheduler.setNotificationStatus(notificationsStatus);
                module.exports.scheduler.startNotificationTimer(1);
            } else {
                // reset the notificationsStatus, but do not schedule
                // another notification
                storageManager.set('notificationsStatus', {
                    notificationTime: Date.now(),
                    count: 1
                });
            }

            module.exports.scheduler.setProgress();
            toolbarButton.showBadge();

        }, intervals.waitInterval / divideBy);
    }
};

exports.onSchedulerEvent = on.bind(null, exports);
