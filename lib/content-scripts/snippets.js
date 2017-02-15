'use strict';

let self = require('sdk/self');

let { utils } = require('../utils.js');

exports.snippets = {
    imgLocationURL: 'media/icons/snippets/',
    replaceSnippetCopy: function(sidebarProps, contentURL) {
        let step = sidebarProps.step;
        let track = sidebarProps.track;
        let snippetContent;

        snippetContent = utils.processTmpl(self.data.load(contentURL));
        snippetContent = snippetContent.replace(
            '$url',
            self.data.url(this.imgLocationURL + 'snippet' + step + '_' + track + '.png')
        );

        return snippetContent;
    }
};
