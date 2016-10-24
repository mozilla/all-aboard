'use strict';

/**
 * Read only module for defined intervals
 */
var Intervals = {
    // Time to wait before auto closing the sidebar after user interaction
    afterInteractionCloseTime: 120000,
    // the default interval between sidebars. Here set as hours.
    defaultSidebarInterval: 24,
    // the time to wait before automatically closing the sidebar
    defaultSidebarCloseTime: 300000,
    // 3 weeks in milliseconds
    nonuseDestroyTime: 1814400000,
    // 1 day in milliseconds
    oneDay: 86400000,
    // 1 minute in milliseconds
    oneMinute: 60000,
    timeElapsedFormula: 3600000,
    // the total number of steps before the reward sidebar
    totalStepCount: 4,
    // 24 hours in milliseconds
    waitInterval: 86400000
};

exports.intervals = Intervals;
