'use strict';

var fxAccountsContainer = document.querySelector('.fxaccounts');
var choices = {};
var dismiss;
var heading;
var mainContainer;
var noThanks = '<a href="about:home" id="dismiss" class="no-thanks">No thanks</a>';

/**
 * Ammends the utm_campaign param passed when submitting the FxA form, to indicate
 * whether it was submitted by a self identified utility or values user.
 */
function ammendUtmCampaign() {
    var baseUtmString = 'utm_campaign=fxa-embedded-form';
    var track = choices.whatMatters === 'utility' ? '-fx' : '-moz';
    var fxaIframe = fxAccountsContainer.querySelector('#fxa');
    var originFormSrc = fxaIframe.dataset['src'];
    var originIframeSrc = fxaIframe.src;
    // http://regexr.com/3dkso
    var utmRegex = /utm_campaign=[\w+-{1}]+/g;

    // update the utm_campaign parameter
    fxaIframe.dataset['src'] = originFormSrc.replace(utmRegex, baseUtmString + track);
    fxaIframe.src = originIframeSrc.replace(utmRegex, baseUtmString + track);
}

// shows the default heading and the Fx accounts widget
function showFxAccountWidget() {
    var innerContainer = document.querySelector('#intro .inner-container');
    innerContainer.removeChild(document.querySelector('#all-aboard'));
    // show the default heading and the Fx accounts widget
    heading.style.display = 'block';
    mainContainer.style.display = 'block';

    fxAccountsContainer.insertAdjacentHTML('afterend', noThanks);

    // ammend utm param
    ammendUtmCampaign();
}

// hide the default heading and the Fx accounts widget
function hideFxAccountWidget() {
    heading.style.display = 'none';
    mainContainer.style.display = 'none';
}

/**
 * Shows the questions dialog on the /firstrun page
 * @param {string} tmpl - The firstrun template HTML as a string
 */
function showDialog(tmpl) {
    mainContainer.insertAdjacentHTML('afterend', tmpl);
    document.querySelector('#all-aboard').focus();
    interactionHandler();
}

/**
 * Handles submission of form elements in dialog
 */
function interactionHandler() {
    var addonContent = document.querySelector('#all-aboard');
    var button = addonContent.querySelector('button');
    var yupNope = addonContent.querySelector('#yup_nope');
    var whatMatters = addonContent.querySelector('.what-matters');

    dismiss = document.querySelector('#dismiss');
    // listen for a click event on the 'No Thanks' link and send preference
    dismiss.addEventListener('click', function() {
        self.port.emit('onboardingDismissed', 'true');
    });

    // when the user selects either yup or nope, show the second question
    yupNope.addEventListener('change', function() {
        addonContent.classList.add('step2');

        // as soon as the user has interacted with the first questions
        // hide the no thanks link until we call showFxAccountWidget
        dismiss.classList.add('hidden');

        whatMatters.classList.remove('hidden');
        whatMatters.setAttribute('aria-hidden', false);
    });

    whatMatters.addEventListener('change', function() {
        button.classList.remove('hidden');
        button.setAttribute('aria-hidden', false);
    });

    button.addEventListener('click', function() {
        var checkedElems = addonContent.querySelectorAll('input[type="radio"]:checked');

        for (var i = 0,l = checkedElems.length; i < l; i++) {
            choices[checkedElems[i].name] = checkedElems[i].value;
        }

        self.port.emit('dialogSubmit', choices);

        showFxAccountWidget();
    });
}

/**
 * listen for the modify event emitted from the add-on, and only then,
 * start executiion of the code.
 * @param {string} tmpl - The firstrun template HTML as a string
 */
self.port.on('modify', function(tmpl) {
    // see whether a Firefox Accounts section exists
    if (fxAccountsContainer) {
        heading = document.querySelector('#intro header h2');
        mainContainer = document.querySelector('.fxaccounts-container');

        hideFxAccountWidget();
        showDialog(tmpl);
    }
});
