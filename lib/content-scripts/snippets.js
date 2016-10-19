'use strict';

var self = require('sdk/self');

exports.snippets = {
    imgURL: 'media/progress/trophy-active.svg',
    snippetCopyArray: [
        'Free range. Master Firefox and get a gift.',
        'Free to play. Master Firefox and get a gift.',
        'Free to find. Master Firefox and get a gift.',
        'Free to roam. Master Firefox and get a gift.'
    ],
    replaceSnippetCopy: function(sidebarProps, contentURL) {
        let step = sidebarProps.step;
        let snippetContent;

        if (step !== 'reward') {
            snippetContent = self.data.load(contentURL)
                                 .replace('%snippetCopy', this.snippetCopyArray[step - 1])
                                 .replace('%url', self.data.url(this.imgURL));
        } else {
            snippetContent = self.data.load(contentURL)
                                 .replace('%url', self.data.url(this.imgURL));
        }

        return snippetContent;
    }
};
