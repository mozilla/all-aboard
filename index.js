var buttons = require('sdk/ui/button/action');
var pageMod = require('sdk/page-mod');
var preferences = require("sdk/simple-prefs").prefs;
var sidebar = require('sdk/ui/sidebar');
var tabs = require('sdk/tabs');
var timers = require('sdk/timers');

var visible = false;

var allAboard = buttons.ActionButton({
    id: 'all-aboard',
    label: 'Mozilla Firefox Onboarding',
    icon: {
        '16': './media/icons/icon-16.png',
        '32': './media/icons/icon-32.png',
        '64': './media/icons/icon-64.png'
    },
    onClick: toggleSidebar
});

var content = sidebar.Sidebar({
    id: 'allboard-content',
    title: 'Welcome to Firefox',
    url: './index.html',
    onDetach: enableTrigger
});

content.on('show', function() {
    visible = true;
});

content.on('hide', function() {
    visible = false;
});

// loads and executes a script when on /firstrun page
// http://regexr.com/3dbrq
pageMod.PageMod({
    include: /.*firefox[\/\d*|\w*\.*]*\/firstrun\//,
    contentScriptFile: './js/firstrun.js',
    contentScriptWhen: 'ready',
    contentStyleFile: './css/firstrun.css',
    onAttach: function(worker) {
        worker.port.on('isNewUser', function(isNewUser) {
            preferences.isNewUser = isNewUser;
        });

        worker.port.on('whatMatters', function(whatMatters) {
            preferences.whatMatters = whatMatters;
        });
    }
});

// fake a content notification
var highlighter = timers.setTimeout(showBadge, 2000);

function showBadge() {
    timers.clearTimeout(highlighter);
    allAboard.state('window', {
        badge: '1',
        badgeColor: '#5F9B0A'
    });
}

function enableTrigger() {
    allAboard.state('window', {
        disabled: false
    });
}

function toggleSidebar(state) {
    // clears the badge
    allAboard.state('window', {
        badge: null
    });

    if (visible) {
        content.hide();
    } else {
        content.show();
    }
}
