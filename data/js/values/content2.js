(function() {
    var answer = document.querySelector('#answer');
    var button = document.querySelector('button');
    var token = document.querySelector('#token2');

    button.addEventListener('click', function() {
        // highlight the answer
        answer.classList.add('answer');
        // show the token
        token.style.backgroundImage = "url('/data/media/tokens/values/token2.svg')";
    });

})();
