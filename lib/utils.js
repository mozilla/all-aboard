'use strict';

let _ = require('sdk/l10n').get;
var prefService = require('sdk/preferences/service');
var self = require('sdk/self');
var tabs = require('sdk/tabs');

var { emit, once } = require('sdk/event/core');
var { isNumber } = require('sdk/lang/type');

var { intervals } = require('lib/intervals.js');

exports.utils = {
    aboutHomeReloaded: false,
    /**
     * Overrides time interval defauls from config file.
     */
    overrideDefaults: function() {
        try {
            // load the config file
            let config = self.data.load('./../config.json');

            // if the file existed, parse the contents to a JSON object
            if (config) {
                config = JSON.parse(config);
                // override time intervals with values from config if they exist
                intervals.afterInteractionCloseTime = config.afterInteractionCloseTime || intervals.afterInteractionCloseTime;
                intervals.defaultSidebarInterval = config.defaultSidebarInterval || intervals.defaultSidebarInterval;
                intervals.defaultSidebarCloseTime = config.defaultSidebarCloseTime || intervals.defaultSidebarCloseTime;
                intervals.timeElapsedFormula = config.timeElapsedFormula || intervals.timeElapsedFormula;
                intervals.waitInterval = config.waitInterval || intervals.waitInterval;
                intervals.nonuseDestroyTime = config.nonuseDestroyTime || intervals.nonuseDestroyTime;
            }
        } catch(e) {
            console.error('Either no config.json file was created, or it was placed at the wrong location. Error:', e);
        }
    },
    /**
     * Processes a HTML tmpl for localisation and returns the result
     * @param {string} tmpl - The HTML as a string
     */
    processTmpl: function(tmpl) {
        let regex = /%[\w]+/;
        let resultsArray = [];

        while ((resultsArray = regex.exec(tmpl)) !== null) {
            let match = resultsArray[0];
            // replaces the matched template string with the localised string
            tmpl = tmpl.replace(match, _(match.substr(1)));
        }

        return tmpl;
    },
    /**
     * Check to see if about:home is loaded as the active homepage.
     * If so, we should refresh it so that our pagemod shows up.
     */
    reloadAboutHome: function() {
        // When Firefox opens, we should check and see if about:home is loaded as the active homepage.
        // If so, we should refresh it so that our pagemod shows up
        try {
            if (tabs.activeTab.url === 'about:home' && !this.aboutHomeReloaded) {
                this.aboutHomeReloaded = true;
                tabs.activeTab.reload();
            }
        } catch (e) {
            console.error('Could not reload snippet content: ', e);
        }
    },
    /**
    * Updates the distribution.id preference
    * @param {string} value - The new value to append.
    */
    updatePref: function(value) {
        let distributionId = prefService.get('distribution.id');
        var newValue;

        // if the distribution.id does not exist, prepend mozilla88
        if (typeof distributionId === 'undefined') {
            prefService.set('distribution.id', _('distribution_id') + value);
            return;
        } else {
            let trailingNumberRegex = /-\d/g;
            let distributionIdUpdated = distributionId.length > 10;

            // if the distribution.id has not been updated, update it
            // now with whatever value was passed.
            if (!distributionIdUpdated) {
                prefService.set('distribution.id', distributionId + value);
                return;
            }

            // if the distribution.id has been updated, only allow updates
            // to the step currently stored.
            if (distributionIdUpdated && isNumber(value)) {
                let newStep = '-' + value;
                // if the current distribution.id ends with a number
                if (trailingNumberRegex.test(distributionId)) {
                    // strip of the current step before appending the new one.
                    newValue = distributionId.replace(trailingNumberRegex, newStep);
                } else {
                    newValue = distributionId + newStep;
                }
                prefService.set('distribution.id', newValue);
            }
        }
    },
    /** This is called to explicitly 'uninstall' the addon, destroying functional
     *  pieces needed for user interaction, effectively removing the addon
     */
    destroy: function () {
        emit(exports, 'intent', 'destroy');
    },
    /**
     * Determines the number of milliseconds left until the destroy function should be called.
     * @param {string} destroyTimerStartTime - Time in milliseconds read from storage
     * @returns The number of milliseconds as an int
     */
    getRemainingTTL: function(destroyTimerStartTime) {
        let timeElapsed = Date.now() - destroyTimerStartTime;
        let timeRemaining = parseInt(intervals.nonuseDestroyTime - timeElapsed, 10);
        // if the remaining time is not more than zero, return 1000 milliseconds.
        // this will also avoid any possible negative values being returned.
        return timeRemaining > 0 ? timeRemaining : 1000;
    },
    /**
    * Determines the amount of time to wait before showing the next notification
    * @param {int} timeSinceCTAComplete - Time in milliseconds since last sidebar interaction
    * @returns The number of hours as milliseconds.
    */
    getRemainingWaitTime(timeSinceCTAComplete) {
        return parseInt(intervals.timeElapsedFormula *
            (intervals.defaultSidebarInterval - timeSinceCTAComplete));
    },
    /**
    * Determines the number of hours that has elapsed since the last sidebar was shown.
    * @param {string} sidebarLaunchTime - Time in milliseconds read from storage
    * @returns The number of hours as an int.
    */
    getTimeElapsed: function(sidebarLaunchTime) {
        var lastSidebarLaunch = new Date(sidebarLaunchTime);
        return parseInt((Date.now() - lastSidebarLaunch.getTime()) / intervals.timeElapsedFormula, 10);
    }
};

// From the MDN docs:
// https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_event_targets
// "delegate to the corresponding function from event/core, and use bind() to pass the
// exports object itself as the target argument to the underlying function."
exports.once = once.bind(null, exports);
