'use strict';

var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var tabs = require('sdk/tabs');

var { scheduler } = require('../scheduler.js');
var { storageManager } = require('../storage-manager.js');
var { toolbarButton } = require('../toolbar-button.js');
var { utils, once } = require('../utils.js');

var firstrunRegex = /.*firefox[\/\d*|\w*\.*]*\/firstrun\/.*/;

exports.firstrun = {
    firstRun: undefined,
    /**
     * Stops pagemod from making more modifications on firstrun in the future,
     * and disables its further use
     */
    destroy: function() {
        if (this.firstRun) {
            this.firstRun.destroy();
        }
    },
    /**
    * Modifies the /firstrun page
    * http://regexr.com/3dbrq
    * This will only have an effect if there is a DOM element with a class of .fxaccounts
    */
    modifyFirstrun: function() {

        this.firstRun = pageMod.PageMod({
            include: firstrunRegex,
            contentScriptFile: './js/firstrun.js',
            contentScriptWhen: 'ready',
            contentStyleFile: './css/firstrun.css',
            onAttach: function(worker) {
                var firstRunTmpl;
                var utility = self.data.load('./tmpl/fragments/what-matters-option1.html');
                var values = self.data.load('./tmpl/fragments/what-matters-option2.html');
                // generate a random number, 1 or 2
                var firstOption = Math.floor(Math.random() * 2) + 1;

                // depeding upon the random number, either set values option first, or utility option first
                if (firstOption === 2) {
                    firstRunTmpl = self.data.load('./tmpl/firstrun.html').replace('%optionOne', values).replace('%optionTwo', utility);
                } else {
                    firstRunTmpl = self.data.load('./tmpl/firstrun.html').replace('%optionOne', utility).replace('%optionTwo', values);
                }

                // only emit the modify event if the user has not dismissed on-boarding,
                // and has not answered the questions.
                if (typeof storageManager.get('onboardingDismissed') === 'undefined'
                    && typeof storageManager.get('isOnBoarding') === 'undefined') {
                    // because calling destroy does not unregister the injected script
                    // we do not want the script to be self executing. We therefore intentionally
                    // emit an event that tells the firstrun code to execute, we also pass the
                    // template as a string.
                    worker.port.emit('modify', firstRunTmpl);
                }

                // listens for the destroy event emitted by utils
                once('intent', function(intent) {
                    if (intent === 'destroy') {
                        module.exports.firstrun.destroy();
                    }
                });

                worker.port.on('dialogSubmit', function(choices) {
                    storageManager.set('isOnBoarding', choices.isOnBoarding);
                    storageManager.set('whatMatters', choices.whatMatters);
                    utils.updatePref('-' + choices.whatMatters + '-' + choices.isOnBoarding);

                    // if haven't gotten to our first step, the action button will not exist
                    // create and add it now before the first notification.
                    if(typeof storageManager.get('step') === 'undefined') {
                        toolbarButton.addAddOnButton();
                    }
                    // starts the timer that will call showBadge and queue up the first sidebar
                    scheduler.startNotificationTimer(12);
                    // And store our onboarding initialization time so that we can set a new timer for the first notification if the user exits and restarts the session
                    storageManager.set('lastSidebarCTACompleteTime', Date.now());
                    // note that we haven't sent our notification for this sidebar yet
                    storageManager.set('shownNotification', false);
                });

                // listens for a message from pageMod when a user clicks on "No thanks"
                // before answering any of the questions
                worker.port.on('onboardingDismissed', function(dismissed) {
                    storageManager.set('onboardingDismissed', dismissed);
                    utils.updatePref('-no-thanks');
                    // user has opted out of onboarding, destroy the addon
                    utils.destroy();
                });

                // listens for a message from pageMod when a user clicks on "No thanks"
                // after having answered the questions and clicked "Go!"
                worker.port.on('noFxAccounts', function() {
                    tabs.open('about:newtab');
                });

                // The code below will be executed once(1 time) when the user navigates away from the
                // firstrun page. This is when we need to show the import data sidebar, as well
                // as register a listener that will call modifyFirstrun if the user has not answered
                // the questions or dismissed onboarding
                tabs.once('ready', function() {
                    // only register the tabs listener if both onboardingDismissed and
                    // isOnBoarding are undefined.
                    if (typeof storageManager.get('onboardingDismissed') === 'undefined'
                        && typeof storageManager.get('isOnBoarding') === 'undefined') {
                        tabs.on('ready', function() {
                            // besides ensuring that we are on the firstrun page,
                            // also ensure the above still holds true before calling modifyFirstrun
                            if (firstrunRegex.test(tabs.activeTab.url)
                                && typeof storageManager.get('onboardingDismissed') === 'undefined'
                                && typeof storageManager.get('isOnBoarding') === 'undefined') {
                                this.modifyFirstrun();
                            }
                        });
                    }

                    // If the yup/nope question has been answered,
                    // and the user is on a page other than /firstrun,
                    // we can safely destroy the firstrun pageMod.
                    if (typeof storageManager.get('isOnBoarding') !== 'undefined'
                        && !firstrunRegex.test(tabs.activeTab.url)) {
                        // destroy the pageMod as it is no longer needed
                        module.exports.firstrun.destroy();

                        // if user has not received first notification, the action button will not exist.
                        // Create and add it now before the first notification. This code will be
                        // reached if the user clicked netiher of the "No thanks" links and,
                        // either signed up/in or simply navigated away from the firstrun page.
                        if(typeof storageManager.get('step') === 'undefined') {
                            toolbarButton.addAddOnButton();

                            var newtabOpen = false;
                            for (let tab of tabs) {
                                if(tab.url === 'about:newtab') {
                                    newtabOpen = true;
                                }
                            }

                            if (!newtabOpen) {
                                tabs.open({
                                    url: 'about:newtab',
                                    inBackground: true
                                });
                            }
                        }
                    }
                });
            }
        });
    }
};
