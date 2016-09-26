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
     * Calls the delayedNotification only if the user has not seen 3
     * notifications already. Only called on browser startup
     */
    conditionalDelayedNotification: function() {
        let notificationsStatus = storageManager.get('notificationsStatus');

        // if the user did not see any notifications before closing their
        // browser, initialize the notificationsStatus count to zero.
        if (typeof notificationsStatus === 'undefined') {
            module.exports.scheduler.setNotificationCount(1);
            notificationsStatus = storageManager.get('notificationsStatus');
        }

        // the user has seen less than or equal to 2 notifications
        if (notificationsStatus.count <= 2) {
            module.exports.scheduler.delayedNotification();
            // update the number of notifications
            module.exports.scheduler.setNotificationStatus(notificationsStatus);
        } else if (notificationsStatus.count === 3) {
            // this is the third notification.
            module.exports.scheduler.delayedNotification();
            // explcitly set notification count to 4. This ensures that
            // there will not be any more notifications on startup, unless
            // the user completes the CTA
            module.exports.scheduler.setNotificationCount(4);
        }
    },
    /**
     * Calls toolbarButton.showBadge() after a 60 second delay.
     */
    delayedNotification: function() {
        timers.setTimeout(function() {
            toolbarButton.showBadge();
        }, intervals.oneMinute);
    },
    /**
     * Clears all timers and then calls destroy in utils to "uninstall" the add-on
    */
    destroyAddOn: function() {
        // clear any autoCloseTimer that may be scheduled
        module.exports.scheduler.clearTimers();
        // clear any scheduled notifications
        module.exports.scheduler.clearNotificationTimer();
        // destroys the addon
        utils.destroy();
    },
    /**
     * Restarts the destroy timer for the amount of time that remain until
     * the add-on should be detroyed.
     * @param {int} interval - The time to ait for calling destroyAddOn in milliseconds
     */
    restartDestroyTimer: function(interval) {
        // schedule a new destroy timer
        destroyTimer = timers.setTimeout(function() {
            module.exports.scheduler.destroyAddOn();
        }, interval);
    },
    /**
     * Starts the timer based upon the afterInteractionCloseTime to destroy the addon
     */
    startDestroyTimer: function() {
        // clear any previously scheduled destroyTimer
        timers.clearTimeout(destroyTimer);
        // store the time when we scheduled the timer. This
        // will be used to restart the timer on startup.
        storageManager.set('destroyTimerStartTime', Date.now());
        // schedule a new destroy timer
        destroyTimer = timers.setTimeout(function() {
            module.exports.scheduler.destroyAddOn();
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
        // as we just completed the CTA, reset the notifications count
        module.exports.scheduler.resetNotificationStatus();

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
     * Resets the notificationsStatus
     */
    resetNotificationStatus: function() {
        storageManager.set('notificationsStatus', {
            notificationTime: Date.now(),
            count: 1
        });
    },
    /**
     * Sets the notification status count to the specified count
     * @param {int} count - The new notification count value
     */
    setNotificationCount: function(count) {
        storageManager.set('notificationsStatus', {
            notificationTime: Date.now(),
            count: count
        });
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
        // increment the notification count
        module.exports.scheduler.setNotificationCount(count + 1);
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
                module.exports.scheduler.resetNotificationStatus();
            }

            module.exports.scheduler.setProgress();
            toolbarButton.showBadge();

        }, intervals.waitInterval / divideBy);
    }
};

exports.onSchedulerEvent = on.bind(null, exports);
