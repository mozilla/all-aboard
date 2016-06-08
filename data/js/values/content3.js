(function() {
    var button = document.querySelector('#tell_me');
    var pbContent = document.querySelector('#private_browsing');
    var pbButton = document.querySelector('#pb_button');

    button.addEventListener('click', function() {
        pbContent.removeAttribute('class');
    });

    pbButton.addEventListener('click', function() {
        addon.port.emit('intent', 'privateBrowsing');
    });

})();
