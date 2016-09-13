'use strict';

var self = require('sdk/self');

exports.snippets = {
    imgURL: 'media/icons/progress/trophy.svg',
    utilityCopy: 'Free to choose. Master Firefox and get a gift.',
    valuesCopyArray: [
        'Who stands behind Firefox? Pass the quiz and we’ll send you something cool.',
        'What gets Mozilla out of bed in the morning? Pass the quiz and we’ll send you something cool.',
        'Why does Mozilla care about privacy? Pass the quiz and we’ll send you something cool.',
        'You’d love to learn about staying secure online, but… Pass the quiz and we’ll send you something cool.',
        '10,000+ is... Pass the quiz and we’ll send you something cool.'
    ],
    replaceSnippetCopy: function(sidebarProps, contentURL) {
        let track = sidebarProps.track;
        let step = sidebarProps.step;
        let snippetContent;

        if (track === 'utility' && step !== 'reward') {
            snippetContent = self.data.load(contentURL)
                                 .replace('%snippetCopy', this.utilityCopy)
                                 .replace('%url', self.data.url(this.imgURL));
        } else if (track === 'values' && step !== 'reward') {
            snippetContent = self.data.load(contentURL)
                                 .replace('%snippetCopy', this.valuesCopyArray[step - 1])
                                 .replace('%url', self.data.url(this.imgURL));
        } else {
            snippetContent = self.data.load(contentURL)
                                 .replace('%url', self.data.url(this.imgURL));
        }

        return snippetContent;
    }
};
