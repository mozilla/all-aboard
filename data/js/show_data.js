(function() {
    var button = document.querySelector('button');
    button.addEventListener('click', function() {
        addon.port.emit('intent', 'getHistory');
    });

    addon.port.on('history', function(history) {
    	var index = 1;
    	history.forEach(function(result) {
            //console.log("history " +result.url);
            if(index <=3)
            	document.querySelector('#history' + index++).innerHTML = result.url;   
        });
    });

    addon.port.on('bookmarks', function(bookmarks) {
    	var index = 1;
    	bookmarks.forEach(function(result) {
            //console.log("bookmarks " +result.url);
            if(index <=3 && !result.url.includes("mozilla"))
            	document.querySelector('#bookmarks' + index++).innerHTML = result.url;   
        });
    });
})();
