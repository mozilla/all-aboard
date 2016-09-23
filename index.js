'use strict';

// built in SDK imports
var timers = require('sdk/timers');

// All Aboard module imports
var { intervals } = require('lib/intervals.js');
var { scheduler } = require('lib/scheduler.js');
var { sidebarManager } = require('lib/sidebar-manager.js');
var { storageManager } = require('lib/storage-manager.js');
var { toolbarButton } = require('lib/toolbar-button.js');
var { utils } = require('lib/utils.js');

var { aboutHome } = require('lib/content-scripts/about-home.js');
var { firstrun } = require('lib/content-scripts/firstrun.js');
var { newtab } = require('lib/content-scripts/newtab.js');

var timer;

/**
 * This is called when the add-on is unloaded. If the reason is either uninstall,
 *  disable or shutdown, we can do some cleanup.
 */
exports.onUnload = function(reason) {
    if (reason === 'uninstall' || reason === 'disable') {
        utils.destroy();
    } else if (reason === 'shutdown') {
        // if the user closes the browser while a sidebar
        // is open, on restart, the add-on will still think
        // that the sidebar is open so, we explicitly set it
        // to false here.
        storageManager.set('isSidebarVisible', false);
    }
};

/**
* Initializes the add-on, and checks the time elapsed
* since a sidebar was last shown.
*/
exports.main = function() {
    // set's up the addon for dev mode.
    utils.overrideDefaults();

    let lastCTACompleteTime = storageManager.get('lastSidebarCTACompleteTime');
    let timeSinceCTAComplete = utils.getTimeElapsed(lastCTACompleteTime);
    let lastStep = storageManager.get('step');

    // When Firefox opens, we should check and see if about:home is loaded as the active homepage.
    // If so, we should refresh it so that our pagemod shows up
    utils.reloadAboutHome();

    // do not call modifynewtab if we've already modified it once
    if (typeof storageManager.get('seenUserData') === 'undefined') {
        newtab.modifyNewtab();
    }

    // Call modifyFirstrun if the user has not opted out and, have not already
    // answered the questions(as both questions need to be answered, checking
    // for the first one is enough).
    if (typeof storageManager.get('onboardingDismissed') === 'undefined'
        && typeof storageManager.get('isOnBoarding') === 'undefined') {
        firstrun.modifyFirstrun();
    }

    // The user has not seen the first sidebar, and has not received the first notification but,
    // the user has completed firstrun, i.e. Closed the browser before the first notification
    if (typeof lastStep === 'undefined' && typeof lastCTACompleteTime !== 'undefined'
        && storageManager.get('shownNotification') === false) {
        let timeSinceLastCTAInteraction = Date.now() - lastCTACompleteTime;
        // move the experience to step 1
        sidebarManager.setSidebarProps();
        // it has been more than 2 hours since firstrun was completed.
        // Trigger the delayedNotification which will pop a notification
        // after a 60 second delay.
        if (timeSinceLastCTAInteraction > intervals.waitInterval / 12) {
            scheduler.delayedNotification();
        } else {
            // it has been less then two hours between restarts so, simply
            // reschedule the first sidebar notification for two hours from now.
            scheduler.startNotificationTimer(12);
        }
    } else if (typeof lastStep !== 'undefined' && lastStep !== 'reward') {
        // user has seen at least step 1, and we aren't at the reward sidebar
        let isCTAComplete = storageManager.get('ctaComplete');
        // clear any potential running timers, mainly in
        // case exports.main is running due to an update
        timers.clearTimeout(timer);

        // the user has completed the CTA of the last displayed sidebar,
        // before closing the browser.
        if (typeof isCTAComplete !== 'undefined' && isCTAComplete) {
            // less than 24hrs has passed since completion.
            if (timeSinceCTAComplete <= intervals.defaultSidebarInterval) {
                // create a new timer with the time left in our timer
                // that didn't persist between sessions
                timer = timers.setTimeout(function() {
                    toolbarButton.showBadge();
                }, utils.getRemainingWaitTime(timeSinceCTAComplete));
            } else if (timeSinceCTAComplete > intervals.defaultSidebarInterval) {
                // more than 24hrs has passed since completion.
                scheduler.delayedNotification();
            }
        } else if (typeof isCTAComplete === 'undefined' || !isCTAComplete) {
            // the user saw the last sidebar before closing the
            // browser but, did not interact with it.
            scheduler.delayedNotification();
        }

        sidebarManager.setSidebarProps();
        toolbarButton.addAddOnButton();
        aboutHome.modifyAboutHome(storageManager.get('sidebarProps'));

    } else if (storageManager.get('step') === 'reward') {
        // if we've reached the reward sidebar, just modify about:home
        aboutHome.modifyAboutHome({
            track: 'reward'
        });
    }
};
