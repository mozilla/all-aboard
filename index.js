'use strict';

// built in SDK imports
var tabs = require('sdk/tabs');
var timers = require('sdk/timers');

// All Aboard module imports
var { intervals } = require('lib/intervals.js');
var { notificationsManager } = require('lib/notification-manager.js');
var { scheduler } = require('lib/scheduler.js');
var { sidebarManager } = require('lib/sidebar-manager.js');
var { storageManager } = require('lib/storage-manager.js');
var { toolbarButton } = require('lib/toolbar-button.js');
var { utils } = require('lib/utils.js');

var { aboutHome } = require('lib/content-scripts/about-home.js');
var { firstrun } = require('lib/content-scripts/firstrun.js');
var { newtab } = require('lib/content-scripts/newtab.js');

var timer;
var aboutHomeReloaded = false;

/**
 * This is called when the add-on is unloaded. If the reason is either disable,
 * or shutdown, we can do some cleanup.
 */
exports.onUnload = function() {
    utils.destroy();
};

/**
* Initializes the add-on, and checks the time elapsed
* since a sidebar was last shown.
*/
exports.main = function() {
    // set's up the addon for dev mode.
    utils.overrideDefaults();

    let lastCTACompleteTime = storageManager.get('lastSidebarCTACompleteTime');

    // the user has not seen the first sidebar, and has not received the first notification but,
    // the user has completed firstrun.
    if (typeof storageManager.get('step') === 'undefined'
        && typeof lastCTACompleteTime !== 'undefined'
        && storageManager.get('shownNotification') === false) {

        let timeSinceLastCTAInteraction = Date.now() - lastCTACompleteTime;

        // add the add-on ActionButton
        toolbarButton.addAddOnButton();

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
    }

    // if the user has seen at least step 1, and we aren't already to the reward sidebar
    // OR if the user is onboarding and hasn't seen a step yet or they aren't to the 5th step,
    // get the sidebar props for the current step, add the actionButton, and modify about:home
    if ((typeof storageManager.get('step') !== 'undefined' && storageManager.get('step') < 5) ||
        typeof storageManager.get('isOnBoarding') !== 'undefined' && storageManager.get('step') < 5) {
        toolbarButton.addAddOnButton();
        sidebarManager.setSidebarProps();
        aboutHome.modifyAboutHome(storageManager.get('sidebarProps'));
    // else, if we've reached the reward sidebar, just add the all-aboard button to the page
    } else if (storageManager.get('step') >= 5) {
        //add the addon button
        toolbarButton.addAddOnButton();
        aboutHome.modifyAboutHome({
            track: 'reward'
        });
    }

    // When Firefox opens, we should check and see if about:home is loaded as the active homepage.
    // If so, we should refresh it so that our pagemod shows up
    try {
        if (tabs.activeTab.url === 'about:home' && !aboutHomeReloaded) {
            aboutHomeReloaded = true;
            tabs.activeTab.reload();
        }
    } catch (e) {
        console.error('Could not reload snippet content: ', e);
    }

    // catch the anomaly where users aren't getting a notification because their
    // lastSidebarCTACompleteTime isn't set, but they ARE onboarding
    if(typeof storageManager.get('lastSidebarCTACompleteTime') === 'undefined' &&
        typeof storageManager.get('isOnBoarding') !== 'undefined') {
        // update the lastSidebarCTACompleteTime to 24 hours prior to when this line is hit
        storageManager.set('lastSidebarCTACompleteTime', Date.now() - intervals.oneDay);
        // note that we haven't sent our notification for this sidebar yet
        storageManager.set('shownNotification', false);
    }

    // If more than 24 hours have elsapsed since the last time a sidebar was shown or there are less than
    // 60 seconds left until 24 hours has elapased, AND we have not shown the reward sidebar yet, set a 60
    // second timer to notify the user of their sidebar
    if ((((utils.getTimeElapsed(storageManager.get(
        'lastSidebarCTACompleteTime')) >= intervals.defaultSidebarInterval
        || ((utils.timeElapsedFormula * (intervals.defaultSidebarInterval - (utils.getTimeElapsed(storageManager.get('lastSidebarCTACompleteTime'))))) < intervals.oneMinute))
        && typeof storageManager.get('rewardSidebarShown') === 'undefined'))
        && (!storageManager.get('shownNotification')))  {
        // if all of the above is true, wait 60 seconds and then notify
        scheduler.delayedNotification();

    // If 24 hours hasn't yet elapsed and we haven't yet shown the reward sidebar, start a new timer as if
    // the old timer never stopped counting
    } else if ((utils.getTimeElapsed(storageManager.get('lastSidebarCTACompleteTime')) <
        intervals.defaultSidebarInterval) && typeof storageManager.get('rewardSidebarShown') === 'undefined') {
        // clear any potential open timers (there shouldn't be any persisting, but doing it anyway in case
        // exports.main is running due to an update)
        timers.clearTimeout(timer);
        // create a new timer with the time left in our timer that didn't persist between sessions
        timer = timers.setTimeout(function() {
            notificationsManager.showBadge();
        }, (utils.timeElapsedFormula * (intervals.defaultSidebarInterval -
            (utils.getTimeElapsed(storageManager.get('lastSidebarCTACompleteTime'))))));
    }

    // do not call modifyFirstrun again if the user has either opted out or,
    // already answered a questions(as both questions need to be answered, checking
    // for the first one is enough).
    if (typeof storageManager.get('onboardingDismissed') === 'undefined'
        && typeof storageManager.get('isOnBoarding') === 'undefined') {
        firstrun.modifyFirstrun();
    }

    // do not call modifynewtab if we've already modified it once
    if(typeof storageManager.get('seenUserData') === 'undefined') {
        newtab.modifyNewtab();
    }
};
