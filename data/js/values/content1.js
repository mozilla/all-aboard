(function() {
    var answer = document.querySelector('#answer');
    var button = document.querySelector('button');
    var token = document.querySelector('#token1');

    button.addEventListener('click', function() {
        // highlight the answer
        answer.classList.add('answer');
        // set the token container to active
        token.classList.add('active');
        // show the token
        token.querySelector('img').removeAttribute('class');
    });

})();
