'use strict';

const CONTENT_STORE = {
    utility: [
        {
            id: 'allaboard-utility-content1',
            title: 'Searching'
        },
        {
            id: 'allaboard-utility-content2',
            title: 'Private Browsing'
        },
        {
            id: 'allaboard-utility-content3',
            title: 'Customizing'
        },
        {
            id: 'allaboard-utility-content4',
            title: 'History and Bookmarks'
        },
        {
            id: 'allaboard-utility-content5',
            title: 'Mobile'
        }
    ],
    values: [
        {
            id: 'allaboard-values-content1',
            title: 'Organization'
        },
        {
            id: 'allaboard-values-content2',
            title: 'Different'
        },
        {
            id: 'allaboard-values-content3',
            title: 'Privacy'
        },
        {
            id: 'allaboard-values-content4',
            title: 'Security'
        },
        {
            id: 'allaboard-values-content5',
            title: 'Community'
        }
    ]
};

const SNIPPET_COPY = {
    utility: [
        {
            copy1: 'If searching makes you smarter and Firefox searches faster, then Firefox makes you smarter, faster.',
            copy2: 'Win bets more quickly. Search faster.',
            copy3: 'Free to search. More search options than the others.'
        },
        {
            copy1: 'Your invisibility cloak awaits.',
            copy2: 'Ditch the trackers.',
            copy3: 'Free to be private. Only Firefox lets you turn off the trackers.'
        },
        {
            copy1: 'We bet your other browser didn’t let you move icons around.',
            copy2: 'Unlike the others, moving stuff around is one of our perks.',
            copy3: 'Free to make it yours. Let’s put things where you want them.'
        },
        {
            copy1: 'This is your browser. This is your browser on bookmarks. Any questions?',
            copy2: 'Feeding Firefox makes it even more powerful. Import your bookmarks and witness true power.',
            copy3: 'T-minus 10, 9, 8… the bookmark toolbar is your launch pad. Activate toolbar now.'
        },
        {
            copy1: 'Join 100,000,000 people browsing freely on their phones.',
            copy2: 'Voila! your tabs and history auto-magically appear on your phone.',
            copy3: 'Leave no tab behind. Switch from laptop to phone and continue where you Webbed off.'
        }
    ],
    values: [
        {
            copy1: 'Non-profit. Non-compromised. Less Filling.',
            copy2: 'The Mozilla Foundation is the independent, non-profit organization behind Firefox.',
            copy3: 'The Mozilla Foundation created Firefox to put some awesomesauce on the Web.'
        },
        {
            copy1: 'Mozilla doesn’t just make Firefox. We also fight to set the Web free.',
            copy2: 'Mozilla is on a mission to protect the Web.',
            copy3: 'Help Mozilla stand up to corporate domination of the Web.'
        },
        {
            copy1: 'Our private browsing mode is better than theirs.',
            copy2: 'Mozilla believes your online life is your business.',
            copy3: 'We believe the web is for browsing, not being browsed.'
        },
        {
            copy1: 'Build your online safety net.',
            copy2: 'Is your password a superhero?',
            copy3: 'Online security doesn’t have to be a mystery.'
        },
        {
            copy1: 'Be a Web know-it-all and do the Web some good.',
            copy2: 'Now Playing: cyber security, government surveillance, the free Web.',
            copy3: 'You’re different, that’s why we like you. Keep up with issues surrounding the Web.'
        }
    ]
};

var buttons = require('sdk/ui/button/action');
var notifications = require('sdk/notifications');
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var sidebar = require('sdk/ui/sidebar');
var simpleStorage = require('sdk/simple-storage').storage;
var tabs = require('sdk/tabs');
var timers = require('sdk/timers');
var utils = require('lib/utils.js');
var windowUtils = require('sdk/window/utils');
// staging for automigrate to land
//Cu.import("resource:///modules/AutoMigrate.jsm");
//var canUndoPromise = AutoMigrate.canUndo();

var syncPref = 'services.sync.account';
var sync = require('sdk/preferences/service').get(syncPref);

var { Cu } = require('chrome');
var { XMLHttpRequest } = require('sdk/net/xhr');
var UITour = Cu.import('resource:///modules/UITour.jsm').UITour;
var LightweightThemeManager = Cu.import('resource://gre/modules/LightweightThemeManager.jsm').LightweightThemeManager;

// the browser window object where we can grab individual node (like the awesome bar)
var activeWindow = windowUtils.getMostRecentBrowserWindow();
// the awesomebar node from the browser window
var awesomeBar = activeWindow.document.getElementById('urlbar');
// whether we have assigned a token for our current content step
var assignedToken = false;
var aboutHome;
var aboutNewtab;
// Time to wait before auto closing the sidebar after user interaction
var afterInteractionCloseTime = 120000;
var allAboard;
var content;
var firstRun;
// the default interval between sidebars. Here set as hours.
var defaultSidebarInterval = 24;
// the time to wait before automatically closing the sidebar
var defaultSidebarCloseTime = 300000;
var firstrunRegex = /.*firefox[\/\d*|\w*\.*]*\/firstrun\/.*/;
// is the sidebar currently visible
var isVisible = false;
var sidebarProps;
var timeElapsedFormula = 1000*60*60;
var timer;
var timersArray = [];
var destroyTimer = -1;
// 24 hours in milliseconds
var waitInterval = 86400000;
// 3 weeks in milliseconds
var nonuseDestroyTime = 1814400000;

/**
* Determines the number of hours that has elapsed since the last sidebar was shown.
* @param {string} sidebarLaunchTime - Time in milliseconds read from storage
* @returns The number of hours.
*/
function getTimeElapsed(sidebarLaunchTime) {
    var lastSidebarLaunch = new Date(sidebarLaunchTime);
    return Math.round((Date.now() - lastSidebarLaunch.getTime()) / (timeElapsedFormula));
}

/**
 * Adds the add-on ActionButton to the Firefox browser chrome
 */
function addAddOnButton() {
    // if the action button does not already exist
    if (typeof allAboard === 'undefined') {
        // Create the action button, this will add the add-on to the chrome
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
    }
}

/**
 * Loops through timersArray and clears all timers.
 */
function clearTimers() {
    for (var i = 0, l = timersArray.length; i < l; i++) {
        timers.clearTimeout(timersArray[i]);
    }
}

/**
* Starts a timer that will call the showBadge function after 24 hours, should the
* user not close the browser earlier.
* @param {int} divideBy - number to divide the wait interval by
*/
function startNotificationTimer(divideBy) {
    // to avoid starting multiple timers,
    // proactively clear any existing timer
    timers.clearTimeout(timer);
    // schedule a new timer
    timer = timers.setTimeout(function() {
        showBadge();
    }, waitInterval / divideBy);
}

/**
 * Closes a currently visible sidebar after the defaultSidebarCloseTime
 * @param {int} timeout - Time in milliseconds before function is executed
 */
function autoCloseTimer(timeout) {
    // clear all currently scheduled auto close timers
    clearTimers();

    var autoClose = timers.setTimeout(function() {
        if (isVisible) {
            content.hide();
        }
    }, timeout);

    // push the timer onto the timersArray
    timersArray.push(autoClose);
}

/**
* Utility function to set the desired size for the sidebar.
*/
function setSidebarSize() {
    var activeWindow = windowUtils.getMostRecentBrowserWindow();
    var _sidebar = activeWindow.document.getElementById('sidebar');
    _sidebar.style.width = '320px';
    _sidebar.style.maxWidth = '320px';
}

/**
* Shows a transient desktop notification to the user when new sidebar
* content is available. If the notification is clicked, the new sidebar is shown
* @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK/High-Level_APIs/notifications
*/
function showDesktopNotification() {
    notifications.notify({
        title: 'Welcome Aboard',
        text: 'Firefox has something special for you.',
        iconURL: './media/icons/icon-32_active.png',
        onClick: toggleSidebar
    });
}

/**
* Updates the add-on icon by adding a badge, inicating that there is new content.
* This will also cause the desktop notification to be shown.
*/
function showBadge() {
    allAboard.state('window', {
        badge: '1',
        badgeColor: '#5F9B0A',
        label: '1 new notification',
        icon: {
            '16': './media/icons/icon-16_active.png',
            '32': './media/icons/icon-32_active.png',
            '64': './media/icons/icon-64_active.png'
        }
    });
    showDesktopNotification();
}

/*
 * Opens the search bar
 */
function showSearch() {
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

/*
 * Opens the bookmark menu
 */
function showBookmarks() {
    let activeWindow = windowUtils.getMostRecentBrowserWindow();

    try {
        UITour.showMenu(activeWindow, 'bookmarks');
    } catch(e) {
        console.error('Could not open element. Check if UITour.jsm supports opening of element passed.', e);
    }
}

/**
 * Remove highlight and event listener on the awesomebar
 */
function removeHighlight() {
    UITour.hideHighlight(activeWindow);
    awesomeBar.removeEventListener('focus', removeHighlight);
}

/**
 * Highlight a given item in the browser chrome
 * @param {string} item - Item you wish to highlight's name as a string
 */
function highLight(item) {
    if (item === 'urlbar') {
        awesomeBar.addEventListener('focus', removeHighlight);
    }

    UITour.getTarget(activeWindow, item, false).then(function(chosenItem) {
        try {
            UITour.showHighlight(activeWindow, chosenItem, 'wobble');
        } catch(e) {
            console.error('Could not highlight element. Check if UITour.jsm supports highlighting of element passed.', e);
        }
    });
}

/**
 * Changes the theme based upon the value passed
 * @param {int} themeNum - a number passed based on the button clicked by the user
 */
function changeTheme(themeNum) {
    var personaIDs = [539838, 157076];

    // if there is no number passed, set the theme to default and return
    if (typeof themeNum === 'undefined') {
        LightweightThemeManager.themeChanged(null);
        return;
    }

    // start a new XMLHTTP request to get the theme JSON from AMO
    var personaRequest = new XMLHttpRequest();
    personaRequest.open('GET', 'https://versioncheck.addons.mozilla.org/en-US/themes/update-check/' + personaIDs[themeNum-1]);

    personaRequest.onload = function() {
        try {
            // get the theme JSON from the response
            var theme = JSON.parse(personaRequest.response);
            // set the theme
            LightweightThemeManager.themeChanged(theme);
        }
        catch(e) {
            console.error('Invalid Persona', e);
        }
    };

    personaRequest.send();
}

/**
* Manages tokens and emits a message to the sidebar with an array
* of tokens the user has received
* @param {int} step - the step to assign a token for
* @param {object} worker - used to emit the tokens array to the sidebar
*/
function assignTokens(step, worker) {
    let tokens = simpleStorage.tokens || [];
    let token = 'token' + step;
    // flag that we have assigned our token for this sidebar so we can check later
    assignedToken = true;

    // if the token is not currently in the array, add it
    if (tokens.indexOf(token) === -1) {
        tokens.push(token);
        // store the new token
        utils.store('tokens', tokens);
    }
    // emit the array of tokens to the sidebar
    worker.port.emit('tokens', tokens);

    // do not call the timer once we have reached
    // the final content item.
    if (step < 5) {
        // update the lastSidebarLaunchTime to now
        utils.store('lastSidebarLaunchTime', Date.now());
        // start notification timer
        startNotificationTimer(1);
    } else if (step === 5) {
        startNotificationTimer(12);
    }
}

/**
 * Handles intents sent from the various sidebars.
 * @param {string} intent - The intent of the current event
 */
function intentHandler(intent) {
    switch(intent) {
        case 'search':
            showSearch();
            break;
        case 'smarton':
            tabs.open('https://www.mozilla.org/teach/smarton/security/');
            break;
        case 'newsletter':
            tabs.open('https://www.mozilla.org/#newsletter-subscribe');
            break;
        case 'privateBrowsing':
            highLight('privateWindow');
            break;
        case 'template1':
            changeTheme(1);
            break;
        case 'template2':
            changeTheme(2);
            break;
        case 'template3':
            changeTheme(3);
            break;
        case 'defaultTemplate':
            changeTheme();
            break;
        case 'highlightURL':
            highLight('urlbar');
            break;
        case 'claimPrize':
            showRewardSidebar();
            break;
        default:
            break;
    }
}

/**
 * Adds listeners common accross showSidebar and onDemandSidebar
 * @param {object} worker - Worker object for the current sidebar
 */
function attachCommonSidebarListeners(worker) {
    // listens to an intent message and calls the relevant function
    // based on intent.
    worker.port.on('intent', function(intent) {
        intentHandler(intent);
    });

    // listen for click events on the assigned tokens
    worker.port.on('loadSidebar', function(props) {
        // clear all timers in the timersArray
        clearTimers();
        onDemandSidebar(props);
    });
}

/**
 * Shows a specific user requested sidebar. These are sidebars the user has
 * already seen, completed the main CTA, and received a token for.
 * @param {object} sidebarProps - properties for this sidebar instance
 */
function onDemandSidebar(sidebarProps) {
    var sidebarIdTitle = CONTENT_STORE[sidebarProps.track][sidebarProps.step - 1];
    var contentURL = './tmpl/' + sidebarProps.track + '/content' + sidebarProps.step + '.html';

    // if the sidebar is open, close it before calling show again
    // @see https://github.com/mozilla/all-aboard/issues/78 for details
    if (isVisible) {
        content.dispose();
    }

    content = sidebar.Sidebar({
        id: sidebarIdTitle.id,
        title: sidebarIdTitle.title,
        url: contentURL,
        onAttach: function(worker) {

            attachCommonSidebarListeners(worker);

            // listen for events when a user completes a sidebar cta
            worker.port.on('cta_complete', function() {
                // anytime the user interacts with a sidebar, remove the previous destroy timer
                timers.clearInterval(destroyTimer);
                // start a new 3 week destroy timer
                startDestroyTimer(nonuseDestroyTime);
            });
        },
        onDetach: function() {
            if (content) {
                content.dispose();
                isVisible = false;
            }
        },
        onHide: function() {
            isVisible = false;
        },
        onReady: function(worker) {
            // when the sidebar opens, and there are tokens in the list,
            // send it the current list of assigned tokens
            if (typeof simpleStorage.tokens !== 'undefined') {
                worker.port.emit('tokens', simpleStorage.tokens);
            }
        },
        onShow: function() {
            isVisible = true;
        }
    });

    content.show();
    setSidebarSize();
}

function showRewardSidebar() {
    // if the sidebar is open, close it before calling show again
    // @see https://github.com/mozilla/all-aboard/issues/78 for details
    if (isVisible) {
        content.dispose();
    }

    content = sidebar.Sidebar({
        id: 'all-aboard-reward',
        title: 'Prize',
        url: './tmpl/reward.html',
        onAttach: function() {
            // remove the previous 3 week destroy timer
            timers.clearInterval(destroyTimer);
            // start a new 3 week destroy timer
            startDestroyTimer(nonuseDestroyTime);

            // start the auto close timer
            autoCloseTimer(defaultSidebarCloseTime);
        },
        onDetach: function() {
            content.dispose();
            isVisible = false;
            // clear all autoClose timers
            clearTimers();
        },
        onHide: function() {
            isVisible = false;
        },
        onShow: function() {
            isVisible = true;
        }
    });

    content.show();
    setSidebarSize();

    // initialize the about:home pageMod for the reward snippet
    modifyAboutHome('reward');
}

/**
* Shows a sidebar for the current content step.
* @param {object} sidebarProps - properties for this sidebar instance
*/
function showSidebar(sidebarProps) {

    // if the sidebar is open, close it before calling show again
    // @see https://github.com/mozilla/all-aboard/issues/78 for details
    if (isVisible) {
        content.dispose();
    }

    content = sidebar.Sidebar({
        id: sidebarProps.id,
        title: sidebarProps.title,
        url: sidebarProps.url,
        onAttach: function(worker) {

            attachCommonSidebarListeners(worker);

            // listen for events when a user completes a sidebar cta
            worker.port.on('cta_complete', function() {
                // anytime the user interacts with a sidebar, remove the previous 3 week destroy timer
                timers.clearInterval(destroyTimer);
                // start a new 3 week destroy timer
                startDestroyTimer(nonuseDestroyTime);

                // assign new token and notify sidebar as long as we haven't done so already
                if(!assignedToken) {
                    assignTokens(sidebarProps.step, worker);
                    autoCloseTimer(afterInteractionCloseTime);
                }
            });

            // for the mobile sidebar, utility - content5, we assign a token
            // simply for opening the sidebar, no interaction required.
            if (sidebarProps.track === 'utility' && sidebarProps.step === 5) {
                assignTokens(sidebarProps.step, worker);
            }

            // store the current step we are on
            utils.store('step', sidebarProps.step);
            // update the distribution id with the current step
            utils.updatePref('-' + sidebarProps.step);
            // start the auto close timer
            autoCloseTimer(defaultSidebarCloseTime);
        },
        onDetach: function() {
            content.dispose();
            isVisible = false;
            // clear all autoClose timers
            clearTimers();
        },
        onHide: function() {
            isVisible = false;
        },
        onReady: function(worker) {
            // when the sidebar opens, and there are tokens in the list,
            // send it the current list of assigned tokens
            if (typeof simpleStorage.tokens !== 'undefined') {
                worker.port.emit('tokens', simpleStorage.tokens);
            }
        },
        onShow: function() {
            isVisible = true;
        }
    });

    content.show();
    setSidebarSize();

    // initialize the about:home pageMod
    modifyAboutHome(sidebarProps.track, sidebarProps.step);
}

/**
 * Sets additional sidebar properties, step, track, url, and returns the result
 * @returns updated sidebarProps
 */
function getSidebarProps() {
    var track = simpleStorage.whatMatters;
    // we get the properties before we increment the contentStep as arrays are 0 indexed.
    var sidebarProps = CONTENT_STORE[track][simpleStorage.step || 0];
    // determine the current content step we are on
    var contentStep = typeof simpleStorage.step !== 'undefined' ? (simpleStorage.step + 1) : 1;
    // reset our assigned token flag for the new sidebar
    assignedToken = false;

    // store the current step
    utils.store('step', contentStep);

    // set the additional sidebar properties
    sidebarProps.step = contentStep;
    sidebarProps.track = track;
    sidebarProps.url = './tmpl/' + track + '/content' + contentStep + '.html';

    return sidebarProps;
}

/**
* Shows the next sidebar for the current track i.e. values or utility
*/
function toggleSidebar() {
    // anytime the user opens a sidebar, remove the previous 3 week destroy timer
    timers.clearInterval(destroyTimer);
    // start a new 3 week destroy timer
    startDestroyTimer(nonuseDestroyTime);

    // clears the badge and changes the icon back to a non-active state
    allAboard.state('window', {
        badge: null,
        icon: {
            '16': './media/icons/icon-16.png',
            '32': './media/icons/icon-32.png',
            '64': './media/icons/icon-64.png'
        }
    });

    // Ensure that we have not already shown all content items, that at least 24
    // hours have elapsed since we've shown the last sidebar, and that the user has
    // completed the main CTA for the current step before continuing to increment
    // the step counter and show the next sidebar.
    if (simpleStorage.step !== 5 && typeof simpleStorage.tokens !== 'undefined'
        && getTimeElapsed(simpleStorage.lastSidebarLaunchTime) >= defaultSidebarInterval
        && simpleStorage.tokens.indexOf('token' + simpleStorage.step) > -1) {
        // get the current sidebar's properties
        sidebarProps = getSidebarProps();
        // shows the relevant sidebar
        showSidebar(sidebarProps);
    } else {
        if (getTimeElapsed(simpleStorage.lastSidebarLaunchTime) >= defaultSidebarInterval
            && simpleStorage.step === 5) {
            showRewardSidebar();
        } else if (isVisible) {
            // 24 hours has not elapsed since the last content sidebar has been shown so,
            // simply show or hide the current sidebar.
            content.hide();
        } else if (typeof sidebarProps !== 'undefined') {
            // We cannot just simply call .show(), because either the sidebar or
            // browser might have been closed which would have disposed of the
            // sidebar instance. Safest is to get a new instance.
            showSidebar(sidebarProps);
        } else {
            // this is the first time we are showing a content sidebar.
            sidebarProps = getSidebarProps();
            showSidebar(sidebarProps);
        }
    }
}

function replaceSnippetCopy(track, contentURL, imageURL) {
    var snippetContent;
    var copyNumber = Math.floor(Math.random() * 3) + 1;

    switch(copyNumber) {
        case 1:
            // load snippet HTML
            snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace('%snippetCopy', SNIPPET_COPY[track][sidebarProps.step - 1].copy1);
            break;
        case 2:
            // load snippet HTML
            snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace('%snippetCopy', SNIPPET_COPY[track][sidebarProps.step - 1].copy2);
            break;
        case 3:
            // load snippet HTML
            snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace('%snippetCopy', SNIPPET_COPY[track][sidebarProps.step - 1].copy3);
            break;
        default:
            // load snippet HTML
            snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace('%snippetCopy', SNIPPET_COPY[track][sidebarProps.step - 1]);
            break;
    }

    return snippetContent;
}

/**
 * Modifies the about:home page to show a snippet that matches the current sidebar.
 * @param {string} track - The current sidebar's track or reward, for the reward step
 * @param {int} step - The current sidebar's content step
 */
function modifyAboutHome(track, step) {
    aboutHome = pageMod.PageMod({
        include: /about:home/,
        contentScriptFile: './js/about-home.js',
        contentScriptWhen: 'ready',
        contentStyleFile: './css/about-home.css',
        onAttach: function(worker) {
            var contentURL;
            var imageURL;
            var imageBase = 'media/snippets/';

            if (track === 'reward') {
                contentURL = './tmpl/reward-snippet.html';
                imageURL = imageBase + 'reward.png';
            } else {
                // constructs uri to snippet content
                contentURL = './tmpl/' + track + '/content' + step + '-snippet.html';
                imageURL = imageBase + sidebarProps.track + '/content' + sidebarProps.step + '.gif';
            }

            // load snippet HTML
            var snippetContent = replaceSnippetCopy(track, contentURL, imageURL);

            // emit modify event and passes snippet HTML as a string
            worker.port.emit('modify', snippetContent);

            // listens to an intent message and calls the relevant function
            // based on intent.
            worker.port.on('intent', function(intent) {
                switch(intent) {
                    case 'bookmarks':
                        highLight('bookmarks');
                        break;
                    case 'claimPrize':
                        showRewardSidebar();
                        break;
                    case 'customize':
                        highLight('customize');
                        break;
                    case 'privateBrowsing':
                        highLight('privateWindow');
                        break;
                    case 'search':
                        showSearch();
                        break;
                    default:
                        break;
                }
            });
        }
    });
}

/**
* Modifies the /firstrun page
* http://regexr.com/3dbrq
* This will only have an effect if there is a DOM element with a class of .fxaccounts
*/
function modifyFirstrun() {

    firstRun = pageMod.PageMod({
        include: firstrunRegex,
        contentScriptFile: './js/firstrun.js',
        contentScriptWhen: 'ready',
        contentStyleFile: './css/firstrun.css',
        onAttach: function(worker) {
            var firstRunTmpl;
            var utility = self.data.load('./tmpl/fragments/what-matters-option1.html');
            var values = self.data.load('./tmpl/fragments/what-matters-option2.html');
            // generate a random number, 1 or 2
            var firstOption = Math.floor(Math.random() * 2) + 1 ;

            // depeding upon the random number, either set values option first, or utility option first
            if(firstOption === 2) {
                firstRunTmpl = self.data.load('./tmpl/firstrun.html').replace('%optionOne', values).replace('%optionTwo', utility);
            }
            else {
                firstRunTmpl = self.data.load('./tmpl/firstrun.html').replace('%optionOne', utility).replace('%optionTwo', values);
            }

            // only emit the modify event if the user has not dismissed on-boarding,
            // and has not answered the questions.
            if (typeof simpleStorage.onboardingDismissed === 'undefined'
                && typeof simpleStorage.isOnBoarding === 'undefined') {
                // because calling destroy does not unregister the injected script
                // we do not want the script to be self executing. We therefore intentionally
                // emit an event that tells the firstrun code to execute, we also pass the
                // template as a string.
                worker.port.emit('modify', firstRunTmpl);
            }

            worker.port.on('dialogSubmit', function(choices) {
                utils.store('isOnBoarding', choices.isOnBoarding);
                utils.store('whatMatters', choices.whatMatters);
                utils.updatePref('-' + choices.whatMatters + '-' + choices.isOnBoarding);
            });

            // listens for a message from pageMod when a user clicks on "No thanks"
            // before answering any of the questions
            worker.port.on('onboardingDismissed', function(dismissed) {
                tabs.open('about:newtab');
                utils.store('onboardingDismissed', dismissed);
                // user has opted out of onboarding, destroy the addon
                destroy();
            });

            // listens for a message from pageMod when a user clicks on "No thanks"
            // after having answered the questions and clicked "Go!"
            worker.port.on('noFxAccounts', function() {
                tabs.open('about:newtab');
                // if haven't gotten to our first step, the action button will not exist
                // create and add it now before the first notification.
                if(typeof simpleStorage.step === 'undefined') {
                    addAddOnButton();
                }
                // starts the timer that will call showBadge and queue up the next
                // sidebar to be shown.
                startNotificationTimer(1);
            });

            // The code below will be executed once(1 time) when the user navigates away from the
            // firstrun page. This is when we need to show the import data sidebar, as well
            // as register a listener that will call modifyFirstrun if the user has not answered
            // the questions or dismissed onboarding
            tabs.once('ready', function() {
                // only register the tabs listener if both onboardingDismissed and
                // isOnBoarding are undefined.
                if (typeof simpleStorage.onboardingDismissed === 'undefined'
                    && typeof simpleStorage.isOnBoarding === 'undefined') {
                    tabs.on('ready', function() {
                        // besides ensuring that we are on the firstrun page,
                        // also ensure the above still holds true before calling modifyFirstrun
                        if (firstrunRegex.test(tabs.activeTab.url)
                            && typeof simpleStorage.onboardingDismissed === 'undefined'
                            && typeof simpleStorage.isOnBoarding === 'undefined') {
                            modifyFirstrun();
                        }
                    });
                }

                // If the yup/nope question has been answered,
                // and the user is on a page other than /firstrun,
                // we can safely destroy the firstrun pageMod.
                if (typeof simpleStorage.isOnBoarding !== 'undefined'
                    && !firstrunRegex.test(tabs.activeTab.url)) {
                    // destroy the pageMod as it is no longer needed
                    firstRun.destroy();

                    // if haven't gotten to our first step, the action button will not exist.
                    // Create and add it now before the first notification. This code will be
                    // reached if the user clicked netiher of the "No thanks" links and,
                    // either signed up/in or simply navigated away from the firstrun page.
                    if(typeof simpleStorage.step === 'undefined') {
                        addAddOnButton();
                    }

                    // starts the timer that will call showBadge and queue up the next
                    // sidebar to be shown.
                    startNotificationTimer(1);
                }
            });
        }
    });
}

/**
 * Modifies the about:newtab page to show a user's imported data
 */
function modifyNewtab() {
    aboutNewtab = pageMod.PageMod({
        include: /about:newtab/,
        contentScriptFile: './js/about-newtab.js',
        contentScriptWhen: 'ready',
        contentStyleFile: './css/about-newtab.css',
        onAttach: function(worker) {
            // constructs uri to snippet content
            var headerContentURL = './tmpl/about-newtab-header.html';
            var footerContentURL = './tmpl/about-newtab-footer.html';
            // load snippet HTML
            var headerContent = self.data.load(headerContentURL).replace('%url', self.data.url('media/moving-truck.png'));
            // don't load the footer if the user has a sync account
            if (typeof sync !== 'undefined') {
                footerContent = '';
            }
            // do load the footer if the user doesn't have a sync account
            else {
                var footerContent = self.data.load(footerContentURL);
            }

            // emit modify event and passes snippet HTML as a string
            worker.port.emit('modify', headerContent, footerContent);

           /* staging for autoimport code
           canUndoPromise.then(canUndo => {
                if (!canUndo) {
                    // emit remove event for the footer if we aren't able to undo the import
                    worker.port.emit('removeFooter');*/

                    // listens to an intent message and calls the relevant function
                    // based on intent.
                    worker.port.on('intent', function(intent) {
                        switch(intent) {
                            case 'showAwesomebar':
                                highLight('urlbar');
                                break;
                            case 'showBookmarks':
                                showBookmarks();
                                break;
                            case 'undoMigrate':
                                // staging for automigrate to land:
                                //autoMigrate.undo();
                                break;
                            default:
                                break;
                        }
                    });
                /*}

                // listens to an intent message and calls the relevant function
                // based on intent.
                worker.port.on('intent', function(intent) {
                    switch(intent) {
                        case 'undoMigrate':
                            AutoMigrate.undo();
                            break;
                        default:
                            break;
                    }
                });
            });*/

            // flag that we've shown the user their data
            utils.store('seenUserData', true);
        }
    });
}

/**
 * Overrides time interval defauls from config file.
 */
function overrideDefaults() {
    try {
        // load the config file
        let config = self.data.load('./../config.json');

        // if the file existed, parse the contents to a JSON object
        if (config) {
            config = JSON.parse(config);
            // override time intervals with values from config if they exist
            afterInteractionCloseTime = config.afterInteractionCloseTime || afterInteractionCloseTime;
            defaultSidebarInterval = config.defaultSidebarInterval || defaultSidebarInterval;
            defaultSidebarCloseTime = config.defaultSidebarCloseTime || defaultSidebarCloseTime;
            timeElapsedFormula = config.timeElapsedFormula || timeElapsedFormula;
            waitInterval = config.waitInterval || waitInterval;
            nonuseDestroyTime = config.nonuseDestroyTime || nonuseDestroyTime;
        }
    } catch(e) {
        console.error('Either no config.json file was created, or it was placed at the wrong location. Error:', e);
    }
}

/**
 * Starts the timer based upon the afterInteractionCloseTime to destroy the addon
 */
function startDestroyTimer(destroyTime) {
    destroyTimer = timers.setTimeout(function() {
        // clear any autoCloseTimer that may be scheduled
        clearTimers();
        // destroys the addon
        destroy();
    }, destroyTime);
}

/** This is called to explicitly 'uninstall' the addon, destroying functional
 *  pieces needed for user interaction, effectively removing the addon
 */
function destroy() {
    // removes the currently running timer, if one exists
    timers.clearInterval(timer);

    // removes the button from the UI, and disables its further use
    if(allAboard) {
        allAboard.destroy();
    }

    // stops pagemod from making more modifications on abouthome in the future, and disables its further use
    if(aboutHome) {
        aboutHome.destroy();
    }

    // stops pagemod from making more modifications on firstrun in the future, and disables its further use
    if(firstRun) {
        firstRun.destroy();
    }

    // stops pagemod from making more modifications on newtab in the future, and disables its further use
    if(aboutNewtab) {
        aboutNewtab.destroy();
    }

    // destroys the addon sidebar, and disables its further use
    if(content) {
        content.dispose();
    }
}

/** This is called when the add-on is unloaded. If the reason is either disable,
 * or shutdown, we can do some cleanup.
 */
exports.onUnload = function(reason) {
    if (reason === 'disable' || reason === 'shutdown') {

        if (typeof aboutHome !== 'undefined') {
            aboutHome.destroy();
        }

    }
};

/**
* Initializes the add-on, and checks the time elapsed
* since a sidebar was last shown.
*/
exports.main = function(options) {
    // set's up the addon for dev mode.
    overrideDefaults();

    if (options.loadReason === 'startup') {
        // if the sidebar was open during Firefox shutdown, it will be shown by
        // default when Firefox is started up again. The sidebar will not be
        // sized appropriately though so, we call setSidebarSize
        setSidebarSize();

        // if the user has seen at least step 1, we need to add the ActionButton
        // now, or else the code in the following conditional could try to show
        // a notification to the user but, this will error because allAboard is undefined.
        if (typeof simpleStorage.step !== 'undefined') {
            addAddOnButton();
        }

        // Check whether lastSidebarLaunchTime exists and if it does, check whether
        // more than 24 hours have elsapsed since the last time a sidebar was shown.
        if (simpleStorage.lastSidebarLaunchTime !== 'undefined'
            && getTimeElapsed(simpleStorage.lastSidebarLaunchTime) > defaultSidebarInterval) {
            // if all of the above is true, wait 60 seconds and then notify
            timers.setTimeout(function() {
                showBadge();
            }, 60000);
        }

        // edge case time: If simpleStorage.step is undefined, it means the user has not seen
        // even our first sidebar. This also means that simpleStorage.lastSidebarLaunchTime will
        // be undefined so, no need to check that. The user might however have answered the
        // initial on-boarding questions and then closed Firefox(or it crashed :-/). This means that
        // if simpleStorage.step is undefined but, simpleStorage.isOnBoarding is not, start the
        // notification timer, and add the add-on button to the chrome.
        if (typeof simpleStorage.step === 'undefined'
            && typeof simpleStorage.isOnBoarding !== 'undefined') {
            startNotificationTimer(1);
            addAddOnButton();
        }
    }

    // do not call modifyFirstrun again if the user has either opted out or,
    // already answered a questions(as both questions need to be answered, checking
    // for the first one is enough).
    if (typeof simpleStorage.onboardingDismissed === 'undefined'
        && typeof simpleStorage.isOnBoarding === 'undefined') {
        modifyFirstrun();
    }

    // do not call modifynewtab if we've already modified it once
    if(typeof simpleStorage.seenUserData === 'undefined') {
        modifyNewtab();
    }
};
