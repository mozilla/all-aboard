'use strict';

var { Cu } = require('chrome');
var { UITour } = Cu.import('resource:///modules/UITour.jsm');
var windowUtils = require('sdk/window/utils');

// the browser window object where we can grab individual node (like the awesome bar)
var activeWindow = windowUtils.getMostRecentBrowserWindow();
// the awesomebar node from the browser window
var awesomeBar = activeWindow.document.getElementById('urlbar');
var awesomeBarListen = false;
// the bookmark button node from the browser window
var bookmarkButton = activeWindow.document.getElementById('bookmarks-menu-button');
var bookmarkListen = false;

exports.sidebarUtils = {
    /**
     * Visibly hides the title of the current sidebar
     * @param {object} activeWindow - The currently active window object
     */
    clearSidebarTitle: function(activeWindow) {
        var sidebarTitle = activeWindow.document.getElementById('sidebar-title');
        // hide visibly so the closing [x] does not float to the left
        sidebarTitle.style.visibility = 'hidden';
    },
    /**
    * Utility function to set the desired size for the sidebar.
    */
    setSidebarSize: function() {
        var activeWindow = windowUtils.getMostRecentBrowserWindow();
        var _sidebar = activeWindow.document.getElementById('sidebar');
        _sidebar.style.width = '320px';
        _sidebar.style.maxWidth = '320px';
        this.clearSidebarTitle(activeWindow);
    },
    /**
     * Remove highlight and event listener on the awesomebar
     */
    removeHighlight: function() {
        UITour.hideHighlight(activeWindow);
        if (awesomeBarListen) {
            awesomeBar.removeEventListener('focus', this.removeHighlight);
            awesomeBarListen = false;
        } else if (bookmarkListen) {
            bookmarkButton.removeEventListener('focus', this.removeHighlight);
            bookmarkListen = false;
        }
    },
    /**
     * Highlight a given item in the browser chrome
     * @param {string} item - Item you wish to highlight's name as a string
     */
    highLight: function(item) {
        if (item === 'urlbar' && !awesomeBarListen) {
            awesomeBar.addEventListener('focus', this.removeHighlight);
            awesomeBarListen = true;
        } else if (item === 'bookmarks' && !bookmarkListen) {
            bookmarkButton.addEventListener('click', this.removeHighlight);
            bookmarkListen = true;
        }

        UITour.getTarget(activeWindow, item, false).then(function(chosenItem) {
            try {
                UITour.showHighlight(activeWindow, chosenItem, 'wobble');
            } catch(e) {
                console.error('Could not highlight element. Check if UITour.jsm supports highlighting of element passed.', e);
            }
        });
    },
    /*
     * Opens the search bar
     */
    showSearch: function() {
        let activeWindow = windowUtils.getMostRecentBrowserWindow();
        let barPromise = UITour.getTarget(activeWindow, 'search');
        let iconPromise = UITour.getTarget(activeWindow, 'searchIcon');

        iconPromise.then(function(iconObj) {
            let searchIcon = iconObj.node;
            searchIcon.click();

            barPromise.then(function(barObj) {
                let searchbar = barObj.node;
                searchbar.updateGoButtonVisibility();
            });
        });
    }
};
