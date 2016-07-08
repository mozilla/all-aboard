'use strict';

var prefService = require('sdk/preferences/service');
var { isNumber } = require('sdk/lang/type');

/**
* Updates the distribution.id preference
* @param {string} value - The new value to append.
*/
exports.updatePref = function(value) {
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
};
