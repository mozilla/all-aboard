'use strict';

var self = require('sdk/self');

var { storageManager } = require('../storage-manager.js');

const SNIPPET_COPY = {
    utility: [
        {
            copy1: 'If searching makes you smarter and Firefox searches faster, then Firefox makes you smarter, faster.',
            copy2: 'Win bets more quickly. Search faster.',
            copy3: 'Free to search. More search options than the others.'
        },
        {
            copy1: 'Your invisibility cloak awaits.',
            copy2: 'Ditch the trackers.',
            copy3: 'Free to be private. Only Firefox lets you turn off the trackers.'
        },
        {
            copy1: 'Free to make it yours. Let’s put things where you want them.',
            copy2: 'Moving stuff around is one of our perks.',
            copy3: 'Let’s put things where you want them.'
        },
        {
            copy1: 'This is your browser. This is your browser on bookmarks. Any questions?',
            copy2: 'Feeding Firefox makes it even more powerful. Cook up some bookmarks and witness true power.',
            copy3: 'T-minus 10, 9, 8… bookmarks are your launch pad.'
        },
        {
            copy1: 'Join the millions browsing freely on their phones.',
            copy2: 'Voilà! Your tabs and history auto-magically appear on your phone.',
            copy3: 'Leave no tab behind. Switch from laptop to phone and continue where you Webbed off.'
        }
    ],
    values: [
        {
            copy1: 'Non-profit. Non-compromised. Less Filling.',
            copy2: 'The Mozilla Foundation is the independent, non-profit organization behind Firefox.',
            copy3: 'The Mozilla Foundation created Firefox to put some awesomesauce on the Web.'
        },
        {
            copy1: 'Mozilla doesn’t just make Firefox. We also fight to set the Web free.',
            copy2: 'Mozilla is on a mission to protect the Web.',
            copy3: 'Help Mozilla stand up to corporate domination of the Web.'
        },
        {
            copy1: 'Our private browsing mode is better than theirs.',
            copy2: 'Mozilla believes your online life is your business.',
            copy3: 'We believe the web is for browsing, not being browsed.'
        },
        {
            copy1: 'Build your online safety net.',
            copy2: 'Is your password a superhero?',
            copy3: 'Online security doesn’t have to be a mystery.'
        },
        {
            copy1: 'Be a Web know-it-all and do the Web some good.',
            copy2: 'Now Playing: cyber security and government surveillance.',
            copy3: 'You’re different. That’s why we like you. Keep up with issues surrounding the Web.'
        }
    ]
};

exports.snippets = {
    replaceSnippetCopy: function(sidebarProps, contentURL, imageURL) {
        let snippetContent;
        let copyNumber = Math.floor(Math.random() * 3) + 1;
        let track = sidebarProps.track;
        let step = sidebarProps.step;

        switch(copyNumber) {
            case 1:
                // load snippet HTML
                snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace(
                    '%snippetCopy',
                    SNIPPET_COPY[track][step - 1].copy1
                );
                break;
            case 2:
                // load snippet HTML
                snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace(
                    '%snippetCopy',
                    SNIPPET_COPY[track][step - 1].copy2
                );
                break;
            case 3:
                // load snippet HTML
                snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace(
                    '%snippetCopy',
                    SNIPPET_COPY[track][step - 1].copy3
                );
                break;
            default:
                // load snippet HTML
                snippetContent = self.data.load(contentURL).replace('%url', self.data.url(imageURL)).replace(
                    '%snippetCopy',
                    SNIPPET_COPY[track][step - 1]
                );
                break;
        }

        return snippetContent;
    }
};
