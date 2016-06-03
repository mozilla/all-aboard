(function() {
    // retrieve our default text from the sidebar
    var defaultText = document.querySelector('#default');
    var timeout;
    // set template and hoveremit names
    var templateNames = ['template1','template2','template3'];
    var hoverEmit = ['hoverTemplate1','hoverTemplate2','hoverTemplate3'];

    // add listeners to all of our buttons for hovering and clicking
    for(var x=0; x<templateNames.length; x++)
    {
        // get the current template
        var node = document.querySelector('#' + templateNames[x]);

        // rescope our port emit text locally to access in the eventlistener
        (function(name) {
            node.addEventListener('click', function() {
                // notify addon that we've clicked the button
                addon.port.emit('intent', name);
            });
        })(templateNames[x]);

        // rescope our port emit text locally to access in the eventlistener
        (function(emitText) {
            // add event listeners for hover over all three buttons
            node.addEventListener('mouseenter', function() {
                function callback() {
                    addon.port.emit('intent', emitText);
                }
                clearTimeout(timeout);
                timeout = setTimeout(callback, 150);
            });
        })(hoverEmit[x]);

        // rescope our port emit text locally to access in the eventlistener
        (function(emitText) {
            // add event listeners for hover over all three buttons
            node.addEventListener('mouseleave', function() {
                function callback() {
                    addon.port.emit('intent', 'endhover');
                }
                clearTimeout(timeout);
                timeout = setTimeout(callback, 150);
            });
        })(hoverEmit[x]);

    }

    // add click listener on default theme text option
    defaultText.addEventListener('click', function() {
        // notify addon that we've clicked the button
        addon.port.emit('intent', 'defaultTemplate');
    });
})();
