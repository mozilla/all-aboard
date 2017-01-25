(function() {
    var mainContainer = document.querySelector('main');
    var answer = mainContainer.querySelector('#answer');
    var button = mainContainer.querySelector('#show_answer');
    var options = mainContainer.querySelectorAll('input[type="radio"]');
    var secondaryContent = mainContainer.querySelector('#secondary_content');

    /**
     * Emits a cta_complete message to the add-on which will then assign
     * the relevant token. Hides the main CTA button and shows a message
     * to inform the user of their new token.
     */
    function mainCTAComplete() {
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');

        // loop through the radio buttons, highlighting the answer and disabling
        // the incorrect options.
        for (var i = 0, l = options.length; i < l; i++) {
            var currentOption = options[i];

            if (currentOption.getAttribute('value') === 'answer') {
                // highlight the answer
                answer.classList.add('answer');
                currentOption.click();
            } else {
                currentOption.disabled = true;
            }
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
