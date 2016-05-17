var buttons = require('sdk/ui/button/action');
var notifications = require("sdk/notifications");
var pageMod = require('sdk/page-mod');
var preferences = require("sdk/simple-prefs").prefs;
var self = require('sdk/self');
var sidebar = require('sdk/ui/sidebar');
var simpleStorage = require('sdk/simple-storage');
var tabs = require('sdk/tabs');
var timers = require('sdk/timers');
var utils = require('sdk/window/utils');

var allAboard;
var content;
var firstrunRegex = /.*firefox[\/\d*|\w*\.*]*\/firstrun\//;
var visible = false;

// fake a content notification
var highlighter = timers.setTimeout(showBadge, 2000);

function showBadge() {
    timers.clearTimeout(highlighter);

    notifications.notify({
        title: 'All Aboard',
        text: 'You have a new message',
        iconURL: './media/icons/icon-32.png',
        onClick: toggleSidebar
    });

    allAboard.state('window', {
        badge: '1',
        badgeColor: '#5F9B0A'
    });
}

function toggleSidebar(state) {

    var activeWindow = utils.getMostRecentBrowserWindow();
    var _sidebar = activeWindow.document.getElementById('sidebar');
    _sidebar.style.width = '320px';
    _sidebar.style.maxWidth = '320px';

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

function init() {
    if (self.loadReason === 'install') {
        simpleStorage.storage.installTime = Date.now();
    }

    allAboard = buttons.ActionButton({
        id: 'all-aboard',
        label: 'Mozilla Firefox Onboarding',
        icon: {
            '16': './media/icons/icon-16.png',
            '32': './media/icons/icon-32.png',
            '64': './media/icons/icon-64.png'
        },
        onClick: toggleSidebar
    });

    content = sidebar.Sidebar({
        id: 'allboard-content',
        title: 'Make Firefox your own',
        url: './tmpl/import_data.html',
        onShow: function() {
            visible = true;
        },
        onHide: function() {
            visible = false;
        }
    });

    // loads and executes a script when on /firstrun page
    // http://regexr.com/3dbrq
    pageMod.PageMod({
        include: firstrunRegex,
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

            // listens for a message from pageMod when a user clicks on the "No thanks" link on
            // the new user question on firstrun
            worker.port.on('onboardingDismissed', function(dismissed) {
                preferences.onboardingDismissed = dismissed;
            });
        }
    });

    // listen for ready(essentially DOMContentLoaded) events on tabs
    tabs.on('ready', function(tab) {
        // if this is the active tab and, the url is not a firstrun page
        if (!firstrunRegex.test(tabs.activeTab.url)) {
            // show the sidebar
            toggleSidebar();
        }
    });
}

init();
