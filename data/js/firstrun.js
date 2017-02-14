'use strict';

let fxAccountsContainer = document.querySelector('.fxaccounts');
let choices = {};
let dismiss;
let firstRunContents = {};
let mainContainer;
let pageHeading;
let subHeading;

// shows the default heading and the Fx accounts widget
function showFxAccountWidget() {
    let innerContainer = document.querySelector('#intro .inner-container');
    let noThanks = '<a href="about:home" id="dismiss_fxa" class="no-thanks">' + firstRunContents.dismissMsg + '</a>';
    innerContainer.removeChild(document.querySelector('#all-aboard'));

    // update the main page heading.
    pageHeading.textContent = firstRunContents.pageHeadingSecondary;
    // update the sub heading
    subHeading.textContent = firstRunContents.pageSubHeadingSecondary;

    // show the Fx accounts widget
    mainContainer.style.display = 'block';

    fxAccountsContainer.insertAdjacentHTML('afterend', noThanks);

    dismiss = document.querySelector('#dismiss_fxa');
    // listen for a click event on the 'No Thanks' link and send preference
    dismiss.addEventListener('click', function() {
        self.port.emit('noFxAccounts', 'true');
    });
}

/**
 * Shows the questions dialog on the /firstrun page
 */
function showDialog() {
    // update the main page heading.
    pageHeading.textContent = firstRunContents.pageHeadingInit;
    // update the main page sub-heading.
    subHeading.textContent = firstRunContents.pageSubHeadingInit;

    mainContainer.insertAdjacentHTML('afterend', firstRunContents.tmpl);
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
 * @param {object} data - An object containing the template and page titles.
 */
self.port.on('modify', function(data) {

    // see whether a Firefox Accounts section exists
    if (fxAccountsContainer) {
        // try to grab the stuff we're going to insert into the page
        let allAboardDialog = document.querySelector('#all-aboard');

        pageHeading = document.querySelector('#masthead h1');
        firstRunContents = data;

        // if it isn't inserted already, call the function to insert it
        if (allAboardDialog === null) {
            subHeading = document.querySelector('#intro header h2');
            mainContainer = document.querySelector('.fxaccounts-container');
            mainContainer.style.display = 'none';

            showDialog();
        }
    }
});
