(function() {
    var answer = document.querySelector('#answer');
    var button = document.querySelector('button');

    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    button.addEventListener('click', function() {
        // highlight the answer
        answer.classList.add('answer');
    });

})();
