'use strict';

var { storage } = require('sdk/simple-storage');

/**
 * A class that manages storage of data for the add-on.
 */
exports.storageManager = {
    /**
     * Stores the passed item in simpleStorage
     * @param {string} key - The associated key for the value
     * @param {mixed} value - The value to store. This could be of different types, see below
     * https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-storage
     */
    set: function(key, value) {
        try {
            storage[key] = value;
        } catch(e) {
            console.error('Error storing item ' + key, e);
        }
    },
    /**
     * Get's an item from simpleStorage
     * @param {string} key - The associated key for the value
     */
    get: function(key) {
        return storage[key];
    }
};
