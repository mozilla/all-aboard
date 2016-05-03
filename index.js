var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var sidebar = require('sdk/ui/sidebar');

function showContent(state) {
    content.show();
}

var content = sidebar.Sidebar({
    id: 'allboard-content',
    title: 'Welcome to Firefox',
    url: './index.html'
});

var allAboard = buttons.ActionButton({
    id: 'all-aboard',
    label: 'Mozilla Firefox Onboarding',
    icon: {
        '16': './media/icons/icon-16.png',
        '32': './media/icons/icon-32.png',
        '64': './media/icons/icon-64.png'
    },
    onClick: showContent
});
