'use strict';

var fxAccountsContainer = document.querySelector('.fxaccounts');
var choices = {};
var contentContainer;
var dismiss;
var heading;
var mainContainer;

// template strings
var dialog = '<section id="all-aboard" class="dialog">' +
             '<header>' +
             '<h2>Have you used Firefox in the last 30 days?</h2>' +
             '<br><div id="yup_nope" class="form-elements">' +
             '<br><label for="yup">' +
             '<input type="radio" name="isOnBoarding" value="existing" id="yup" />yup</label>' +
             '<br><br><label for="nope">' +
             '<input type="radio" name="isOnBoarding" value="new" id="nope" />nope</label>' +
             '</div>' +
             '</header>' +
             '<main class="what-matters hidden" aria-hidden="true">' +
             '<h2>Are you more:</h2>' +
             '<label for="features">' +
             '<input type="radio" name="whatMatters" value="utility" id="features" />Do it yourself</label>' +
             '<label for="values">' +
             '<input type="radio" name="whatMatters" value="values" id="values" />Do good</label>' +
             '</main>' +
             '<footer class="hidden" aria-hidden="true">' +
             '<button type="button" class="button">Go!</button>' +
             '</footer>' +
             '</section>' +
             '<a href="about:home" id="dismiss" class="no-thanks">No thanks</a>';

/**
 * Ammends the utm_campaign param passed when submitting the FxA form, to indicate
 * whether it was submitted by a self identified utility or values user.
 */
function ammendUtmCampaign() {
    var baseUtmString = 'utm_campaign=fxa-embedded-form';
    var track = choices.whatMatters === 'utility' ? '-fx' : '-moz';
    var fxaIframe = fxAccountsContainer.querySelector('#fxa');
    var originFormSrc = fxaIframe.dataset['src'];
    // http://regexr.com/3dkso
    var utmRegex = /utm_campaign=[\w+-{1}]+/g;

    // update the utm_campaign parameter
    fxaIframe.dataset['src'] = originFormSrc.replace(utmRegex, baseUtmString + track);
}

// shows the default heading and the Fx accounts widget
function showFxAccountWidget() {
    var intro = document.querySelector('#intro');
    intro.removeChild(document.querySelector('#all-aboard'));
    // show the default heading and the Fx accounts widget
    heading.style.display = 'block';
    mainContainer.style.display = 'block';

    // show the no thanks link again
    dismiss.classList.remove('hidden');

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
 */
function showDialog() {
    contentContainer = document.querySelector('#intro .container');
    contentContainer.insertAdjacentHTML('afterend', dialog);
    contentContainer.focus();
    interactionHandler();
}

/**
 * Handles submission of form elements in dialog
 */
function interactionHandler() {
    var addonContent = document.querySelector('#all-aboard');
    var button = addonContent.querySelector('button');
    var footer = addonContent.querySelector('footer');
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
        footer.classList.remove('hidden');
        footer.setAttribute('aria-hidden', false);
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

// listen for the modify event emitted from the add-on, and only then,
// start executiion of the code.
self.port.on('modify', function() {
    // see whether a Firefox Accounts section exists
    if (fxAccountsContainer) {
        heading = document.querySelector('#intro header h2');
        mainContainer = document.querySelector('main');

        hideFxAccountWidget();
        showDialog();
    }
});
