'use strict';

var { Cu } = require('chrome');
var configPrefs = require('sdk/preferences/service');
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');

var { sidebarUtils } = require('../sidebar-utils.js');
var { storageManager } = require('../storage-manager.js');
var { once } = require('../utils.js');

exports.newtab = {
    aboutNewtab: undefined,
    /**
     * Stops pagemod from making more modifications on about:newtab in the future,
     * and disables its further use
     */
    destroy: function() {
        if (this.aboutNewtab) {
            this.aboutNewtab.destroy();
        }
    },
    resetPreload: function() {
        // Check to see if the newtab is not being preloaded
        // note: The binary that this addon will be packaged with will have browser.newtab.preload set
        // to false. This is to mitigate the cache overriding our pagemod when users load newtab.
        if(!configPrefs.get('browser.newtab.preload')) {
            // if it isn't being preloaded, now that we've modified the page (loaded the content
            // script), set it to preload in the future
            configPrefs.set('browser.newtab.preload', true);
        }
    },
    /**
     * Modifies the about:newtab page to show a user's imported data
     */
    modifyNewtab: function() {
        this.aboutNewtab = pageMod.PageMod({
            include: /about:newtab/,
            contentScriptFile: './js/about-newtab.js',
            contentScriptWhen: 'ready',
            contentStyleFile: './css/about-newtab.css',
            onAttach: function(worker) {

                try {
                    Cu.import('resource:///modules/AutoMigrate.jsm');
                    var canUndoPromise = AutoMigrate.canUndo();
                }
                catch (e) {
                    console.error('Unable to access automigrate.jsm' + e);
                }

                // constructs uri to snippet content
                var headerContentURL = './tmpl/about-newtab-header.html';
                var footerContentURL = './tmpl/about-newtab-footer.html';
                // load snippet HTML
                var headerContent = self.data.load(headerContentURL).replace('%url', self.data.url('media/moving-truck.png'));
                var footerContent = self.data.load(footerContentURL);

                // try to check if we can undo the auto import
                try {
                    canUndoPromise.then(canUndo => {
                        // if we can't undo the auto import, don't send the footercontent to our sidebar
                        if (!canUndo) {
                            // emit modify event and passes snippet HTML as a string
                            worker.port.emit('modify', headerContent, null);
                        }
                        // if we can undo the auto import, send the footercontent to our sidebar, and then listen for when we would like to actually execute the "undo"
                        else {
                            // emit modify event and passes snippet HTML as a string
                            worker.port.emit('modify', headerContent, footerContent);

                            worker.port.on('intent', function(intent) {
                                if (intent === 'undoMigrate') {
                                    AutoMigrate.undo();
                                }
                            });
                        }
                    });
                // if we couldn't check if we can do the auto import because we weren't able to run the canUndo function, throw an error, and don't modify the newtab page with anything
                } catch(e) {
                    console.error('Not able to resolve autoimport undo promise.' + e);
                }

                // listens for the destroy event emitted by utils
                once('intent', function(intent) {
                    if (intent === 'destroy') {
                        module.exports.newtab.destroy();
                    }
                });

                worker.port.on('intent', function(intent) {
                    switch (intent) {
                        case 'showAwesomebar':
                            sidebarUtils.highLight('urlbar');
                            break;
                        case 'showBookmarks':
                            sidebarUtils.showBookmarks();
                            break;
                        default:
                            break;
                    }
                });

                // Listen for when our content script has modified our page
                worker.port.on('pageModified', function() {
                    // Once the the page is modified, reset the preload preference if it hasn't been already
                    this.resetPreload();
                });

                // flag that we've shown the user their data
                storageManager.set('seenUserData', true);
            }
        });
    }
};
