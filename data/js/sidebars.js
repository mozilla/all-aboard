(function() {
    let claimReward = document.querySelector('.claim-reward');
    let mainCTA = document.getElementById('main_cta');
    let mainCopy = document.getElementById('main_copy');
    let selfPacedContent = document.getElementById('selfpaced');
    let step = parseInt(mainCopy.dataset.step, 10);
    var nextButton;

    // if we're not on the reward sidebar
    if (step < 5) {
        nextButton = document.getElementById('next-button');
        // and attach an event listener to the button
        attachNextButtonListener(nextButton, step);
    }

    /**
     * Emits the CTA intent to the sidebar. For the mobile related
     * sidebar, the intent is explicitly pased based on the store
     * button that was clicked.
     * @param {string} intent - The intent of the CTA clicked [optional]
     */
    function emitIntent(intent) {
        switch(step) {
            case 2:
                addon.port.emit('intent', 'privateBrowsing');
                break;
            case 3:
                addon.port.emit('intent', 'search');
                break;
            case 4:
                addon.port.emit('intent', intent);
                break;
            default:
                break;
        }
    }

    /**
     * Emits a message to the add-on indicating the the main
     * cta has been completed, and then calls swapContent
     * @param {string} intent - The intent of the CTA clicked [optional]
     */
    function mainCTAComplete(intent) {
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
        // emit the intent
        emitIntent(intent);
        swapContent();
    }

    /**
     * Switches the content from the initial messaging and CTA,
     * to the reward and self paced content.
     */
    function swapContent() {
        if (!claimReward) {
            // hide the main copy
            mainCopy.classList.add('hidden');
            // update aria state
            mainCopy.setAttribute('aria-hidden', true);
        }
        // show the reward and self paced content,
        selfPacedContent.classList.remove('hide');
        // update aria state
        selfPacedContent.setAttribute('aria-hidden', false);
    }

    // if we are on step 4, the normal main CTA button will not
    // be present, instead we have the two app store buttons
    if (step === 4) {
        mainCTA = document.querySelectorAll('.main-cta');
        /* because event is overriden in content, we cannot use
         * a delegate on the parent container. We therefore loop
         * over the buttons and attach a listener to each.
         */
        for (let button of mainCTA) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                mainCTAComplete(button.getAttribute('id'));
            });
        }
    } else {
        mainCTA.addEventListener('click', function() {
            mainCTAComplete();
        });
    }

})();
