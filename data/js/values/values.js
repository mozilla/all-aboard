(function() {
    var mainContainer = document.querySelector('main');
    var answer = mainContainer.querySelector('#answer');
    var button = mainContainer.querySelector('#show_answer');
    var options = mainContainer.querySelectorAll('input[type="radio"]');
    var secondaryContent = mainContainer.querySelector('#secondary_content');
    var selfPacedContent = document.getElementById('selfpaced');
    var nextButton;
    var nextToken;

    // if we're not on the final sidebar
    if (parseInt(button.dataset.step, 10) < 5) {
        // grab our next button and next token values
        nextButton = document.getElementById('next-button');
        nextToken = document.getElementById('token' + (parseInt(button.dataset.step, 10) + 1));

        // and attach an event listener to the button
        attachNextButtonListener(nextButton);
    }


    /**
     * Emits a cta_complete message to the add-on which will then assign
     * the relevant token. Hides the main CTA button and shows a message
     * to inform the user of their new token.
     */
    function mainCTAComplete() {
        var prizeButton = document.querySelector('#prize');
        var responseId;
        var responseMsg;
        var selectedOption;

        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');

        // loop through the radio buttons, highlighting the answer and disabling
        // the incorrect options.
        for (var i = 0, l = options.length; i < l; i++) {
            var currentOption = options[i];

            // while we are looping over the radio buttons, get the
            // one which is checked, avoids another DOM traversal.
            if (currentOption.checked) {
                selectedOption = currentOption;
            }

            if (currentOption.getAttribute('value') === 'answer') {
                // highlight the answer
                answer.classList.add('answer');
                currentOption.click();
            } else {
                currentOption.disabled = true;
            }
        }

        // hide main cta button
        button.classList.add('hidden');

        // if the user does not select any of the options, fallback to the correct answer
        responseId = !selectedOption ? 'response_c' : selectedOption.dataset['response'];
        // get and show the response message based on the response data attribute
        // of the checked radio button.
        responseMsg = document.getElementById(responseId);
        responseMsg.classList.remove('hidden');
        responseMsg.setAttribute('aria-hidden', false);

        // unhide "claim your prize!" for final sidebar
        if (prizeButton) {
            prizeButton.classList.remove('hidden');
            prizeButton.setAttribute('aria-hidden', false);

            prizeButton.addEventListener('click', function() {
                addon.port.emit('intent', 'claimPrize');
            });
        } else if (!nextToken.classList.contains('active')) {
            // unhide our next button,
            selfPacedContent.classList.remove('hidden');
            // update aria state
            selfPacedContent.setAttribute('aria-hidden', false);
        }
    }

    button.addEventListener('click', function() {

        mainCTAComplete();

        // show secondary content if it exists
        if (secondaryContent) {
            var secondaryCTA = secondaryContent.querySelector('#secondary_cta');
            secondaryContent.classList.remove('hide');

            secondaryCTA.addEventListener('click', function(event) {
                event.preventDefault();
                addon.port.emit('intent', secondaryCTA.dataset.intent);
            });
        }
    });
})();
