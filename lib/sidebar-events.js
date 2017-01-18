'use strict';

var { emit, on } = require('sdk/event/core');

var { onAboutHomeEvent } = require('./content-scripts/about-home.js');
var { onNotificationEvent } = require('./notification-manager.js');
var { onSchedulerEvent } = require('./scheduler.js');
var { onToolbarButtonEvent } = require('./toolbar-button.js');

onAboutHomeEvent('showSidebar', function(sidebarProps) {
    emit(exports, 'showSidebar', sidebarProps);
});

onNotificationEvent('toggleSidebar', function() {
    emit(exports, 'action', 'toggleSidebar');
});

onSchedulerEvent('hideSidebar', function() {
    emit(exports, 'action', 'hideSidebar');
});

onSchedulerEvent('incrementStep', function() {
    emit(exports, 'action', 'incrementStep');
});

onToolbarButtonEvent('toggleSidebar', function() {
    emit(exports, 'action', 'toggleSidebar');
});

exports.onSidebarEvent = on.bind(null, exports);
