(function() {
    var fxAccountsContainer = document.querySelector('.fxaccounts');
    var addonContent;
    var contentContainer;
    var heading;
    var mainContainer;

    // template strings
    var newUser = '<h2>Are you a new Firefox user?</h2>' +
                  '<label for="question_one">' +
                  '<input type="radio" name="isNewUser" value="yes" id="question_one" />Yes</label>' +
                  '<label for="question_two">' +
                  '<input type="radio" name="isNewUser" value="no" id="question_two" checked />No</label>' +
                  '<button type="button" class="button">Submit</button>' +
                  '<p><a href="about:home" id="dismiss">No thanks</a></p>';
    var values = '<h2>What matters to you?</h2>' +
                  '<label for="question_one">' +
                  '<input type="radio" name="whatMatters" value="values" id="question_one" checked />Values</label>' +
                  '<label for="question_two">' +
                  '<input type="radio" name="whatMatters" value="features" id="question_two" />Features</label>' +
                  '<button type="button" class="button">Submit</button>';

    // shows the default heading and the Fx accounts widget
    function showFxAccountWidget() {
        document.querySelector('.all-aboard-container').style.display = 'none';
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
     * Shows the relevant questions on /firstrun page
     * @param {string} question - The question id
     */
    function showQuestion(question) {
        var button = document.querySelector('.all-aboard-container button');
        addonContent = contentContainer.querySelector('.all-aboard-container');
        addonContent.innerHTML = question === 'values' ? values : newUser;
        contentContainer.focus();

        submitHandler();
    }

    function submitHandler() {
        var button = addonContent.querySelector('button');
        var checkedElem;
        var choice;
        var name;

        // remove any previously attached click listeners
        button.removeEventListener('click');

        button.addEventListener('click', function() {
            checkedElem = addonContent.querySelector('input[type="radio"]:checked');
            choice = checkedElem.value;
            name = checkedElem.name;

            self.port.emit(name, choice);

            if (name === 'isNewUser' && choice === 'yes') {
                showQuestion('values');
            } else {
                showFxAccountWidget();
            }
        });
    }

    // see whether a Firefox Accounts section exists
    if (fxAccountsContainer) {
        contentContainer = document.querySelector('#intro .container');
        heading = document.querySelector('#intro header h2');
        mainContainer = document.querySelector('main');

        hideFxAccountWidget();

        // append the question to the main content container
        contentContainer.insertAdjacentHTML('beforeend', '<div class="all-aboard-container"></div>');

        // shows default user question
        showQuestion();
    }
})();
