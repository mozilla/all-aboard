'use strict';

var prefService = require('sdk/preferences/service');
var simpleStorage = require('sdk/simple-storage').storage;

/**
* Stores a name and value pair using the add-on simple storage API
* https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK/High-Level_APIs/simple-storage
* @param {string} name - The name of the storage item
* @param {string} value - The value to set
*/
exports.store = function(name, value) {
    simpleStorage[name] = value;
};

/**
* Updates the distribution.id preference
* @param {string} value - The new value to append.
*/
exports.updatePref = function(value) {
    let distributionId = prefService.get('distribution.id');
    let newValue;

    // if the distribution.id does not exist, prepend mozilla86
    if (typeof distributionId === 'undefined') {
        newValue = 'mozilla86' + value;
    } else {
        let leadingNumberRegex = /-\d/g;

        // if the current distribution.id ends with a number
        if (leadingNumberRegex.test(distributionId)) {
            // strip of the current step before appending the new one.
            newValue = distributionId.replace(leadingNumberRegex, value);
        } else {
            newValue = distributionId + value;
        }
    }

    prefService.set('distribution.id', newValue);
};
