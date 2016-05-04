var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var sidebar = require('sdk/ui/sidebar');
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
