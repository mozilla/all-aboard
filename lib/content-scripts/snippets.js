'use strict';

var self = require('sdk/self');

exports.snippets = {
    imgURL: 'media/icons/progress/trophy_active.svg',
    utilityCopyArray: [
        'Free to choose. Master Firefox and get a gift.',
        'Free range. Master Firefox and get a gift.',
        'Free to play. Master Firefox and get a gift.',
        'Free to find. Master Firefox and get a gift.',
        'Free to roam. Master Firefox and get a gift.'
    ],
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

        if (track === 'utility') {
            snippetContent = self.data.load(contentURL)
                                 .replace('%snippetCopy', this.utilityCopyArray[step - 1])
                                 .replace('%url', self.data.url(this.imgURL));
        } else if (track === 'values') {
            snippetContent = self.data.load(contentURL)
                                 .replace('%snippetCopy', this.valuesCopyArray[step - 1])
                                 .replace('%url', self.data.url(this.imgURL));
        }

        return snippetContent;
    }
};
