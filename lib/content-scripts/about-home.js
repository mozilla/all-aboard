'use strict';

var { emit, on } = require('sdk/event/core');
var pageMod = require('sdk/page-mod');

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
     * @param {object} sidebarProps - The current sidebar's properties
     */
    modifyAboutHome: function(sidebarProps) {

        var track = sidebarProps.track;
        var step = sidebarProps.step;

        this.aboutHome = pageMod.PageMod({
            include: /about:home/,
            contentScriptFile: './js/about-home.js',
            contentScriptWhen: 'ready',
            contentStyleFile: './css/about-home.css',
            onAttach: function(worker) {
                var contentURL;
                var snippetContent;

                if (track === 'reward') {
                    contentURL = './tmpl/reward-snippet.html';
                } else {
                    // constructs uri to snippet content
                    contentURL = './tmpl/' + track + '/content' + step + '-snippet.html';
                }

                // load snippet HTML
                snippetContent = snippets.replaceSnippetCopy(sidebarProps, contentURL);

                // listens for the destroy event emitted by utils
                once('intent', function(intent) {
                    if (intent === 'destroy') {
                        module.exports.aboutHome.destroy();
                    }
                });

                // emit modify event and passes snippet HTML as a string
                worker.port.emit('modify', snippetContent);

                // listens to an showSidebar message and
                // opens the associated sidebar
                worker.port.on('showSidebar', function(sidebarProps) {
                    emit(exports, 'showSidebar', sidebarProps);
                });
            }
        });
    }
};

exports.onAboutHomeEvent = on.bind(null, exports);
