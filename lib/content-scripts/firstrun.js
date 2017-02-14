'use strict';

let _ = require('sdk/l10n').get;
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var tabs = require('sdk/tabs');

var { scheduler } = require('../scheduler.js');
var { storageManager } = require('../storage-manager.js');
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
                let addOnDestroyed = storageManager.get('addOnDestroyed');

                // before we do anything, check whether the add-on should
                // still be active
                if (typeof addOnDestroyed !== 'undefined' && addOnDestroyed) {
                    // the add-on has already been destroyed, ensure this
                    // pageMod has been destroyed, it will not be if the
                    // page was not active when destroy was called before
                    module.exports.firstrun.destroy();
                    return;
                }

                // only emit the modify event if the user has not dismissed on-boarding,
                // and has not answered the questions.
                if (typeof storageManager.get('onboardingDismissed') === 'undefined'
                    && typeof storageManager.get('isOnBoarding') === 'undefined') {
                    let firstRunContents = {
                        dismissMsg: _('dismiss_msg'),
                        tmpl: module.exports.firstrun.getTemplate(),
                        pageHeadingInit: _('firstrun_main_page_title_init'),
                        pageSubHeadingInit: _('firstrun_main_page_sub_heading_init'),
                        pageHeadingSecondary: _('firstrun_main_page_title_secondary'),
                        pageSubHeadingSecondary: _('firstrun_main_page_sub_heading_secondary')
                    };
                    // because calling destroy does not unregister the injected script
                    // we do not want the script to be self executing. We therefore intentionally
                    // emit an event that tells the firstrun code to execute, we also pass an
                    // object containing the template and main page heading.
                    worker.port.emit('modify', firstRunContents);
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
                                module.exports.firstrun.modifyFirstrun();
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
    },
    /**
     * Sets localised template strings and returns the modified template
     */
    getTemplate: function() {
        const utility = self.data.load('./tmpl/fragments/what-matters-option1.html');
        const values = self.data.load('./tmpl/fragments/what-matters-option2.html');
        // generate a random number, 1 or 2
        let firstOption = Math.floor(Math.random() * 2) + 1;
        let firstRunTmpl = self.data.load('./tmpl/firstrun.html');

        // depeding upon the random number, either set values option first, or utility option first
        if (firstOption === 2) {
            firstRunTmpl = firstRunTmpl.replace('%option_one', values).replace('%option_two', utility);
        } else {
            firstRunTmpl = firstRunTmpl.replace('%option_one', utility).replace('%option_two', values);
        }
        // process the template for localisation and return
        return utils.processTmpl(firstRunTmpl);
    }
};
