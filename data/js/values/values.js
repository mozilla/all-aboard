(function() {
    var answer = document.querySelector('#answer');
    var answerRadio = answer.querySelector('input');
    var button = document.querySelector('button');
    var secondaryContent = document.querySelector('#secondary_content');
    var secondaryCTA = document.querySelector('#secondary_cta');
    var optionA = document.querySelector('#option-a');
    var optionB = document.querySelector('#option-b');

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
        // disable wrong answers
        optionA.disabled = true;
        optionB.disabled = true;
        // main cta action complete, notify add-on
        addon.port.emit('cta_complete');
        // show secondary content if it exists
        if (secondaryContent) {
            secondaryContent.classList.remove('hide');
            button.classList.add('hidden');
        }
    });

    secondaryCTA.addEventListener('click', function(event) {
        event.preventDefault();
        addon.port.emit('intent', secondaryCTA.dataset.intent);
    });

})();
