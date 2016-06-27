(function() {
    var button = document.querySelector('#reward');
    button.onsubmit = function() {
        addon.port.emit('intent', 'stickerRedeemed');
    };
})();
