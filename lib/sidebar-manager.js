'use strict';

var sidebar = require('sdk/ui/sidebar');
var tabs = require('sdk/tabs');

var { intervals } = require('./intervals.js');
var { onSidebarEvent } = require('./sidebar-events.js');
var { scheduler } = require('./scheduler.js');
var { sidebarUtils } = require('./sidebar-utils.js');
var { storageManager } = require('./storage-manager.js');
var { tokensManager } = require('./tokens-manager.js');
var { utils, once } = require('./utils.js');

var { aboutHome } = require('./content-scripts/about-home.js');

// listens to events emited from sidebar-events.js
onSidebarEvent('action', function(action) {
    switch (action) {
        case 'hideSidebar':
            module.exports.sidebarManager.content.hide();
            break;
        case 'incrementStep':
            module.exports.sidebarManager.setSidebarProps();
            break;
        case 'showRewardSidebar':
            module.exports.sidebarManager.showRewardSidebar();
            break;
        case 'toggleSidebar':
            module.exports.sidebarManager.toggleSidebar();
            break;
        default:
            break;
    }
});

// listens for the showSidebar event emited from snippets
onSidebarEvent('showSidebar', function(sidebarProps) {
    if (sidebarProps.step === 'reward') {
        module.exports.sidebarManager.showRewardSidebar();
    } else {
        module.exports.sidebarManager.toggleSidebar();
    }
});

exports.sidebarManager = {
    content: undefined,
    sidebarKeys: {
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
    },
    /**
     * Handles the completion of the main CTA event for each sidebar.
     * @param {boolean} isOnDemand - indicates whether this is an on demand sidebar
     * @param {object} sidebarProps - properties for this sidebar instance
     * @param {object} worker - The event's associated worker.
     */
    ctaComplete: function(isOnDemand, sidebarProps, worker) {
        if (isOnDemand) {
            // If ctaComplete is false, this is the first time the
            // CTA for this step is completed so, schedule the next
            // notification and assign the relevant token
            if (!storageManager.get('ctaComplete')) {
                module.exports.sidebarManager.updateAddOnProgress(sidebarProps, worker);
            }
        } else {
            module.exports.sidebarManager.updateAddOnProgress(sidebarProps, worker);
        }
    },
    /**
     * Destroys the addon sidebar, and disables its future use
     */
    destroy: function() {
        if (module.exports.sidebarManager.content) {
            module.exports.sidebarManager.content.dispose();
        }
    },
    /**
     * Adds id, title and url to sidebarProps for on demand sidebars
     * @param {object} sidebarProps - base properties for this sidebar instance
     * @returns updated sidebarProps object
     */
    getOnDemandProps: function(sidebarProps) {
        let sidebarIdTitle = module.exports.sidebarManager.sidebarKeys[sidebarProps.track][sidebarProps.step - 1];

        sidebarProps.id = sidebarIdTitle.id;
        sidebarProps.title = sidebarIdTitle.title;
        sidebarProps.onDemandURL = './tmpl/' + sidebarProps.track + '/content' + sidebarProps.step + '.html';

        return sidebarProps;
    },
    /**
     * Moves the next CTAComplete time forward in order to automatically progress
     * the onboarding steps
     */
    loadNext: function() {
        // fast forward the lastSidebarCTACompleteTime to complete now
        storageManager.set('lastSidebarCTACompleteTime', intervals.defaultSidebarInterval);
        // update sidebarProps
        module.exports.sidebarManager.setSidebarProps();
        // load the next sidebar with those sidebar props
        module.exports.sidebarManager.showSidebar(storageManager.get('sidebarProps'));
    },
    /**
     * Sets sidebar properties, step, track, url, and returns the result
     */
    setSidebarProps: function() {
        let currentStep = storageManager.get('step');
        let lastCTACompleteTime = storageManager.get('lastSidebarCTACompleteTime');
        let latestToken = 'token' + currentStep;
        let sidebarProps = {};
        let track = storageManager.get('whatMatters');
        let tokens = storageManager.get('tokens') || [];
        let contentStep;

        if (currentStep === 5) {
            sidebarProps = module.exports.sidebarManager.sidebarKeys[track][4];
        } else {
            sidebarProps = module.exports.sidebarManager.sidebarKeys[track][currentStep || 0];
            tokensManager.assignedToken = false;
        }

        // this step's token has been assigned, it's been more than 24 hours since the
        // last sidebar has been completed, we have seen at least 1 sidebar and, we are
        // not on step 5 yet. Move forward by one step.
        if (tokens.indexOf(latestToken) > -1
            && utils.getTimeElapsed(lastCTACompleteTime) >= intervals.defaultSidebarInterval
            && typeof currentStep !== 'undefined'
            && currentStep !== 5) {
            contentStep = parseInt(currentStep, 10) + 1;
        } else {
            contentStep = typeof currentStep !== 'undefined' ? currentStep : 1;
        }

        // set the additional sidebar properties
        sidebarProps.step = contentStep;
        sidebarProps.track = track;
        sidebarProps.url = './tmpl/' + track + '/content' + contentStep + '.html';

        // store the current step
        storageManager.set('step', contentStep);
        // store sidebarProps in simpleStorage
        storageManager.set('sidebarProps', sidebarProps);
    },
    /**
     * Handles intents sent from the various sidebars.
     * @param {string} intent - The intent of the current event
     */
    intentHandler: function(intent) {
        switch (intent) {
            case 'search':
                sidebarUtils.showSearch();
                break;
            case 'smarton':
                tabs.open('https://www.mozilla.org/teach/smarton/security/?utm_source=fxonboarding&amp;utm_medium=firefox-browser&amp;utm_campaign=onboardingv1&amp;utm_content=security');
                break;
            case 'newsletter':
                tabs.open('https://www.mozilla.org/newsletter/mozilla/?utm_source=fxonboarding&amp;utm_medium=firefox-browser&amp;utm_campaign=onboardingv1&amp;utm_content=community');
                break;
            case 'exploreThemes':
                tabs.open('https://addons.mozilla.org/firefox/themes/?utm_source=fxonboarding&amp;utm_medium=firefox-browser&amp;utm_campaign=onboardingv1');
                break;
            case 'appleStore':
                tabs.open('https://mzl.la/1YtDCxH');
                break;
            case 'playStore':
                tabs.open('http://mzl.la/1HKLL5H');
                break;
            case 'privateBrowsing':
                sidebarUtils.highLight('privateWindow');
                break;
            case 'template1':
                sidebarUtils.changeTheme(1);
                break;
            case 'template2':
                sidebarUtils.changeTheme(2);
                break;
            case 'template3':
                sidebarUtils.changeTheme(3);
                break;
            case 'defaultTemplate':
                sidebarUtils.changeTheme();
                break;
            case 'highlightURL':
                sidebarUtils.highLight('urlbar');
                break;
            case 'claimPrize':
                this.showRewardSidebar();
                break;
            default:
                break;
        }
    },
    showRewardSidebar: function() {
        // if the sidebar is open, close it before calling show again
        // @see https://github.com/mozilla/all-aboard/issues/78 for details
        if (storageManager.get('isSidebarVisible') === true) {
            module.exports.sidebarManager.content.dispose();
        }

        module.exports.sidebarManager.content = sidebar.Sidebar({
            id: 'all-aboard-reward',
            title: 'Prize',
            url: './tmpl/reward.html',
            onAttach: function() {
                scheduler.startSidebarTimers();
                // set flag that the reward sidebar has been shown
                storageManager.set('rewardSidebarShown', true);
            },
            onDetach: function() {
                module.exports.sidebarManager.content.dispose();
                storageManager.set('isSidebarVisible', false);
                // clear all autoClose timers
                scheduler.clearTimers();
            },
            onHide: function() {
                storageManager.set('isSidebarVisible', false);
            },
            onShow: function() {
                storageManager.set('isSidebarVisible', true);
            }
        });

        module.exports.sidebarManager.content.show();
        sidebarUtils.setSidebarSize();
    },
    /**
    * Shows a sidebar for the current, or specified, content step.
    * @param {object} sidebarProps - properties for this sidebar instance
    */
    showSidebar: function(sidebarProps) {
        let isOnDemand = false;

        // if sidebarProps.url is undefined, this is an on demand sidebar.
        if (typeof sidebarProps.url === 'undefined') {
            sidebarProps = module.exports.sidebarManager.getOnDemandProps(sidebarProps);
            isOnDemand = true;
        }

        // if the sidebar is open, close it before calling show again
        // @see https://github.com/mozilla/all-aboard/issues/78 for details
        if (storageManager.get('isSidebarVisible') === true) {
            module.exports.sidebarManager.content.dispose();
        }

        module.exports.sidebarManager.content = sidebar.Sidebar({
            id: sidebarProps.id,
            title: sidebarProps.title,
            url: sidebarProps.url || sidebarProps.onDemandURL,
            onAttach: function(worker) {
                // listens for the destroy event emitted by utils
                once('intent', function(intent) {
                    if (intent === 'destroy') {
                        module.exports.sidebarManager.destroy();
                    }
                });

                // listen for events when a user completes a sidebar cta
                worker.port.on('cta_complete', function() {
                    module.exports.sidebarManager.ctaComplete(isOnDemand, sidebarProps, worker);
                });

                // if we're notified that the user selects the "next" button
                worker.port.on('next_selected', function () {
                    module.exports.sidebarManager.loadNext();
                });

                // listens to an intent message and calls the relevant function
                // based on intent.
                worker.port.on('intent', function(intent) {
                    module.exports.sidebarManager.intentHandler(intent);
                });

                // listen for click events on the assigned tokens
                worker.port.on('loadSidebar', function(props) {
                    // clear all timers in the timersArray
                    scheduler.clearTimers();
                    module.exports.sidebarManager.showSidebar(props);
                });

                // start timers
                scheduler.startSidebarTimers();

                // The sidebar was shown via an interaction with the notification
                // toaster, the add-on button or from a button on about:home
                if (typeof sidebarProps.url !== 'undefined' || sidebarProps.aboutHome) {
                    // update the distribution id with the current step
                    utils.updatePref(sidebarProps.step);
                }
            },
            onDetach: function() {
                module.exports.sidebarManager.content.dispose();
                storageManager.set('isSidebarVisible', false);
                // clear all autoClose timers
                scheduler.clearTimers();
            },
            onHide: function() {
                storageManager.set('isSidebarVisible', false);
            },
            onReady: function(worker) {
                // when the sidebar opens, and there are tokens in the list,
                // send it the current list of assigned tokens
                if (typeof storageManager.get('tokens') !== 'undefined') {
                    worker.port.emit('tokens', storageManager.get('tokens'));
                }
            },
            onShow: function() {
                storageManager.set('isSidebarVisible', true);
            }
        });

        module.exports.sidebarManager.content.show();
        sidebarUtils.setSidebarSize();

        // initialize the about:home pageMod
        aboutHome.modifyAboutHome(storageManager.get('sidebarProps'));
    },
    /**
    * Shows the next sidebar for the current track i.e. values or utility
    */
    toggleSidebar: function() {
        let isSidebarVisible = storageManager.get('isSidebarVisible');
        let lastCTACompleteTime = storageManager.get('lastSidebarCTACompleteTime');
        let step = storageManager.get('step');
        let sidebarProps = storageManager.get('sidebarProps');
        let tokensArray = storageManager.get('tokens');

        // if the user has clicked the add-on icon before having received the
        // first notification, and now clicks it again because of the notification,
        // do nothing but, set firstIconInteraction to false so that the flow
        // from here on out will be as expected.
        if (isSidebarVisible === true && storageManager.get('firstIconInteraction')) {
            storageManager.set('firstIconInteraction', false);
            return;
        }

        // Ensure that we have not already shown all content items, that at least 24
        // hours have elapsed since we've shown the last sidebar, and that the user has
        // completed the main CTA for the current step.
        if (step !== 5 && typeof tokensArray !== 'undefined'
            && utils.getTimeElapsed(lastCTACompleteTime) >= intervals.defaultSidebarInterval
            && tokensArray.indexOf('token' + step) > -1) {
            module.exports.sidebarManager.showSidebar(sidebarProps);
        } else {
            if (step === 'reward') {
                if (storageManager.get('isSidebarVisible') === true) {
                    module.exports.sidebarManager.content.hide();
                } else {
                    module.exports.sidebarManager.showRewardSidebar();
                }
            } else if (typeof isSidebarVisible !== 'undefined' && isSidebarVisible === true) {
                // we are not showing a new sidebar but, the current sidebar is open.
                // Simply close it without disposing of the sidebar entirely.
                module.exports.sidebarManager.content.hide();
            } else if (typeof sidebarProps !== 'undefined') {
                // We cannot just simply call .show(), because either the sidebar or
                // browser might have been closed which would have disposed of the
                // sidebar instance. Safest is to get a new instance.
                module.exports.sidebarManager.showSidebar(sidebarProps);
            } else {
                // store a property to indicate that the very first sidebar has been
                // triggered from the add-on icon. This will only ever happen once.
                storageManager.set('firstIconInteraction', true);
                // this is the first time we are showing a content sidebar.
                this.showSidebar(sidebarProps);
            }
        }
    },
    /**
     * Updates the progress of the add-on by scheduling the next notification,
     * assigns the relevant token, and marks the main CTA as complete.
     * @param {object} sidebarProps - properties for this sidebar instance
     * @param {object} worker - The event's associated worker.
     */
    updateAddOnProgress: function(sidebarProps, worker) {
        // schedule the next notification if any
        scheduler.scheduleNextNotification();
        // assign new token
        tokensManager.assignTokens(sidebarProps.step, worker);
        /* Because the sidebar could potentially be shown by clicking
         * a button on one of the about:home snippets, we need to store
         * a variable that indicates that the CTA has already been complete
         * so that subsequent clicks on the CTA, does not assign additional
         * tokens to the user
         */
        storageManager.set('ctaComplete', true);
    }
};
