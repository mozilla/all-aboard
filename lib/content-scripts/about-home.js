'use strict';

var { emit, on } = require('sdk/event/core');
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');

var { sidebarUtils } = require('../sidebar-utils.js');
var { once } = require('../utils.js');

var { snippets } = require('./snippets.js');

exports.aboutHome = {
    aboutHome: undefined,
    /**
     * Stops pagemod from making more modifications on abouthome in the future,
     * and disables its further use
     */
    destroy: function() {
        if (this.aboutHome) {
            this.aboutHome.destroy();
        }
    },
    /**
     * Modifies the about:home page to show a snippet that matches the current sidebar.
     * @param {string} track - The current sidebar's track or reward, for the reward step
     * @param {int} step - The current sidebar's content step
     */
    modifyAboutHome: function(track, step) {
        this.aboutHome = pageMod.PageMod({
            include: /about:home/,
            contentScriptFile: './js/about-home.js',
            contentScriptWhen: 'ready',
            contentStyleFile: './css/about-home.css',
            onAttach: function(worker) {
                var contentURL;
                var imageURL;
                var imageBase = 'media/snippets/';

                var snippetContent;
                if (track === 'reward') {
                    contentURL = './tmpl/reward-snippet.html';
                    imageURL = imageBase + 'reward.png';
                    // load snippet HTML
                    snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL));
                } else {
                    // constructs uri to snippet content
                    contentURL = './tmpl/' + track + '/content' + step + '-snippet.html';
                    imageURL = imageBase + track + '/content' + step + '.gif';
                    // load snippet HTML
                    snippetContent = snippets.replaceSnippetCopy(track, contentURL, imageURL);
                }

                // listens for the destroy event emitted by utils
                once('intent', function(intent) {
                    if (intent === 'destroy') {
                        module.exports.aboutHome.destroy();
                    }
                });

                // emit modify event and passes snippet HTML as a string
                worker.port.emit('modify', snippetContent);

                // listens to an intent message and calls the relevant function
                // based on intent.
                worker.port.on('intent', function(intent) {
                    switch (intent) {
                        case 'bookmarks':
                            sidebarUtils.highLight('bookmarks');
                            break;
                        case 'claimPrize':
                            emit(exports, 'showRewardSidebar');
                            break;
                        case 'customize':
                            sidebarUtils.highLight('customize');
                            break;
                        case 'privateBrowsing':
                            sidebarUtils.highLight('privateWindow');
                            break;
                        case 'search':
                            sidebarUtils.showSearch();
                            break;
                        default:
                            break;
                    }
                });
            }
        });
    }
};

exports.onAboutHomeEvent = on.bind(null, exports);
