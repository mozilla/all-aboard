(function() {

    'use strict';

    var fxAccountsContainer = document.querySelector('.fxaccounts');
    var addonContent;
    var contentContainer;
    var heading;
    var mainContainer;

    // template strings
    var dialog = '<section id="all-aboard" class="dialog">' +
                 '<header>' +
                 '<h2>I’ve used Firefox in the last 30 days?</h2>' +
                 '<div id="yup_nope" class="form-elements">' +
                 '<label for="yup">' +
                 '<input type="radio" name="isOnBoarding" value="existing" id="yup" />yup</label>' +
                 '<label for="nope">' +
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
                 '<footer>' +
                 '<a href="about:home" id="dismiss">No thanks</a>' +
                 '<button type="button" class="button hidden">Go!</button>' +
                 '</footer>' +
                 '</section>';

    // shows the default heading and the Fx accounts widget
    function showFxAccountWidget() {
        document.querySelector('#all-aboard').style.display = 'none';
        // show the default heading and the Fx accounts widget
        heading.style.display = 'block';
        mainContainer.style.display = 'block';
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
        var dismiss = addonContent.querySelector('#dismiss');
        var yupNope = addonContent.querySelector('#yup_nope');
        var whatMatters = addonContent.querySelector('.what-matters');

        // listen for a click event on the 'No Thanks' link and send preference
        dismiss.addEventListener('click', function() {
            self.port.emit('onboardingDismissed', 'true');
        });

        // when the user selects either yup or nope, show the second question
        yupNope.addEventListener('change', function() {
            addonContent.classList.add('step2');
            whatMatters.classList.remove('hidden');
            whatMatters.setAttribute('aria-hidden', false);
        });

        whatMatters.addEventListener('change', function() {
            button.classList.remove('hidden');
        });

        button.addEventListener('click', function() {
            var checkedElems = addonContent.querySelectorAll('input[type="radio"]:checked');
            var choices = {};

            for (var i = 0,l = checkedElems.length; i < l; i++) {
                choices[checkedElems[i].name] = checkedElems[i].value;
            }

            self.port.emit('dialogSubmit', choices);

            showFxAccountWidget();
        });
    }

    // see whether a Firefox Accounts section exists
    if (fxAccountsContainer) {
        heading = document.querySelector('#intro header h2');
        mainContainer = document.querySelector('main');

        hideFxAccountWidget();
        showDialog();
    }
})();
