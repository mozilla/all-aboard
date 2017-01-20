'use strict';

let self = require('sdk/self');

let { utils } = require('../utils.js');

exports.snippets = {
    imgURL: 'media/icons/progress/trophy_active.svg',
    replaceSnippetCopy: function(sidebarProps, contentURL) {
        let snippetContent;

        snippetContent = utils.processTmpl(self.data.load(contentURL));
        snippetContent = snippetContent.replace('$url', self.data.url(this.imgURL));

        return snippetContent;
    }
};
