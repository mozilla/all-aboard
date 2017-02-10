(function() {
    let mainContainer = document.querySelector('main');
    let answer = mainContainer.querySelector('#answer');
    let button = mainContainer.querySelector('#show_answer');
    let options = mainContainer.querySelectorAll('input[type="radio"]');
    let secondaryContent = mainContainer.querySelector('#secondary_content');

    /**
     * Emits a cta_complete message to the add-on which will then assign
     * the relevant token. Hides the main CTA button and shows a message
     * to inform the user of their new token.
     */
    function mainCTAComplete() {
        let infoCopy = document.getElementById('info-copy');
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');

        // the last sidebar does not have the info copy so,
        // we should not attempt to show it.
        if (infoCopy) {
            infoCopy.classList.remove('hide');
            infoCopy.setAttribute('aria-hidden', false);
        }

        // loop through the radio buttons, highlighting the answer and disabling
        // the incorrect options.
        for (let i = 0, l = options.length; i < l; i++) {
            let currentOption = options[i];

            if (currentOption.getAttribute('value') === 'answer') {
                // highlight the answer
                answer.classList.add('answer');
                currentOption.click();
            } else {
                currentOption.disabled = true;
            }
        }
    }

    /**
     * Shows the secondary content block, and adds a listener
     * to the content's main CTA
     */
    function showSecondaryContent() {
        let secondaryCTA = secondaryContent.querySelector('#secondary_cta');

        secondaryContent.classList.remove('hide');
        secondaryContent.setAttribute('aria-hidden', false);

        secondaryCTA.addEventListener('click', function(event) {
            event.preventDefault();
            addon.port.emit('intent', secondaryCTA.dataset.intent);
        });
    }

    button.addEventListener('click', function() {
        mainCTAComplete();

        // hide the show answer button
        button.classList.add('hidden');
        // update the aria-hidden state
        button.setAttribute('aria-hidden', true);

        showSecondaryContent();
    });
})();
