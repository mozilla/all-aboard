(function() {
    // retrieve button from the page
    var appBadges = document.querySelectorAll('.mobile');

    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    for (var i = 0, l = appBadges.length; i < l; i++) {
        // listen for a click event on either of the app store badges
        appBadges[i].addEventListener('click', function() {
            // main cta action complete, notify add-on
            addon.port.emit('cta_complete');
        });
    }
})();
