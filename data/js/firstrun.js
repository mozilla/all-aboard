'use strict';

var fxAccountsContainer = document.querySelector('.fxaccounts');
var choices = {};
var dismiss;
var heading;
var mainContainer;
var noThanks = '<a href="about:home" id="dismiss_fxa" class="no-thanks">No, thanks</a>';

// shows the default heading and the Fx accounts widget
function showFxAccountWidget() {
    var innerContainer = document.querySelector('#intro .inner-container');
    innerContainer.removeChild(document.querySelector('#all-aboard'));
    // show the default heading and the Fx accounts widget
    heading.style.display = 'block';
    mainContainer.style.display = 'block';

    fxAccountsContainer.insertAdjacentHTML('afterend', noThanks);

    dismiss = document.querySelector('#dismiss_fxa');
    // listen for a click event on the 'No Thanks' link and send preference
    dismiss.addEventListener('click', function() {
        self.port.emit('noFxAccounts', 'true');
    });
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
        // try to grab the stuff we're going to insert into the page
        var allAboardDialog = document.querySelector('#all-aboard');
        // if it isn't inserted already, call the function to insert it
        if (allAboardDialog === null) {
            heading = document.querySelector('#intro header h2');
            mainContainer = document.querySelector('.fxaccounts-container');

            hideFxAccountWidget();
            showDialog(tmpl);
        }
    }
});
