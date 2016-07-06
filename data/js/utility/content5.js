(function() {
    var prizeButton = document.querySelector('#prize');

    // by opening this sidebar hte main cta action is
    // complete, notify add-on
    addon.port.emit('cta_complete');

    prizeButton.classList.remove('hidden');
    prizeButton.setAttribute('aria-hidden', false);

    prizeButton.addEventListener('click', function() {
        addon.port.emit('intent', 'claimPrize');
    });
})();
