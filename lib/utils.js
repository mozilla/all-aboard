'use strict';

var prefService = require('sdk/preferences/service');
var self = require('sdk/self');
var { emit, once } = require('sdk/event/core');
var { isNumber } = require('sdk/lang/type');

var { intervals } = require('lib/intervals.js');

exports.utils = {
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
    * Updates the distribution.id preference
    * @param {string} value - The new value to append.
    */
    updatePref: function(value) {
        let distributionId = prefService.get('distribution.id');
        var newValue;

        // if the distribution.id does not exist, prepend mozilla86
        if (typeof distributionId === 'undefined') {
            prefService.set('distribution.id', 'mozilla86' + value);
            return;
        } else {
            let trailingNumberRegex = /-\d/g;
            let distributionIdUpdated = distributionId.length > 9;

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
    * Determines the number of hours that has elapsed since the last sidebar was shown.
    * @param {string} sidebarLaunchTime - Time in milliseconds read from storage
    * @returns The number of hours.
    */
    getTimeElapsed: function(sidebarLaunchTime) {
        var lastSidebarLaunch = new Date(sidebarLaunchTime);
        return (Date.now() - lastSidebarLaunch.getTime()) / (intervals.timeElapsedFormula);
    }
};

// From the MDN docs:
// https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_event_targets
// "delegate to the corresponding function from event/core, and use bind() to pass the
// exports object itself as the target argument to the underlying function."
exports.once = once.bind(null, exports);
