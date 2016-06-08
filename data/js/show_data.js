(function() {
    var button = document.querySelector('button');

    addon.port.on('history', function(history) {
        for(var x = 0, y = history.length; x < y; x++) {
			document.querySelector('#history' + (x+1)).innerHTML = history[x];
		}
    });

    addon.port.on('bookmarks', function(bookmarks) {
        for(var x = 0, y = bookmarks.length; x < y; x++) {
            document.querySelector('#bookmarks' + (x+1)).innerHTML = bookmarks[x];
		}
    });
})();
