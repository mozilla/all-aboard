'use strict';

var self = require('sdk/self');

exports.snippets = {
    imgURL: 'media/progress/trophy-default.svg',
    snippetCopyArray: [
        'Welcome to freedom. Master Firefox and get a gift.',
        'Fight back against trackers. Master Firefox and get a gift.',
        'Don’t settle when searching. Master Firefox and get a gift.',
        'Roam free. Master Firefox and get a gift.',
        'Claim your gift now!'
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
