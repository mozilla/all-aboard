'use strict';

/* exported attachNextButtonListener */

/**
 * Attaches a click handler to the self paced progression button
 * @param {object} nextButton - The button element
 * @param {int} step - The current sidebar step
 */
function attachNextButtonListener(nextButton, step) {
    nextButton.addEventListener('click', function() {
        // notify addon that we've clicked the next button
        if (step !== 4) {
            addon.port.emit('next_selected');
        } else {
            addon.port.emit('intent', 'claimPrize');
        }
    });

    return nextButton;
}
