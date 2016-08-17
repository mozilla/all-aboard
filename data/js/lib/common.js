function attachNextButtonListener (nextButton) {
    nextButton.addEventListener('click', function() {
        // notify addon that we've clicked the next button
        addon.port.emit('next_selected');
    });

    return nextButton;
}
