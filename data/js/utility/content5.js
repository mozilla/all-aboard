(function() {
    var prizeLink = document.querySelector('.prize');
    
    prizeLink.addEventListener('click', function() {
        addon.port.emit('intent', 'claimPrize');
    });
})();
