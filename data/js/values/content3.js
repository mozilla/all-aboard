(function() {
    var answer = document.querySelector('#answer');
    var button = document.querySelector('button');
    var token = document.querySelector('#token3');

    button.addEventListener('click', function() {
        // highlight the answer
        answer.classList.add('answer');
        // show the token
        token.style.backgroundImage = "url('/data/media/tokens/values/token3.svg')";
        // change dimensions for now until we can resize the svg correctly
        token.style.backgroundSize = "35px 38px";
    });

})();