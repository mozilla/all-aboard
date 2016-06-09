(function() {
    var answer = document.querySelector('#answer');
    var answerRadio = answer.querySelector('input');
    var button = document.querySelector('button');
    var secondaryContent = document.querySelector('#secondary_content');
    var secondaryCTA = document.querySelector('#secondary_cta');

    addon.port.on('tokens', function(tokens) {
        for (var i = 0, l = tokens.length; i < l; i++) {
            // set the token container to active and shows the token
            document.querySelector('#' + tokens[i]).classList.add('active');
        }
    });

    button.addEventListener('click', function() {
        // highlight the answer
        answer.classList.add('answer');
        // check the radio button
        answerRadio.click();
        // show secondary content if it exists
        if (secondaryContent) {
            secondaryContent.classList.remove('hide');
        }
    });

    secondaryCTA.addEventListener('click', function(event) {
        event.preventDefault();
        addon.port.emit('intent', secondaryCTA.dataset.intent);
    });

})();
