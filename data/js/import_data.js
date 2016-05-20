(function() {
    var button = document.querySelector('button');
    button.addEventListener('click', function() {
        addon.port.emit('openMigrationTool');
    });

    addon.port.on('migrationCompleted', function() {
        var importSection = document.querySelector('#import');
        var successSection = document.querySelector('#success');

        importSection.classList.add('hidden');
        importSection.setAttribute('aria-hidden', true);

        successSection.classList.remove('hidden');
        successSection.setAttribute('aria-hidden', false);
    });

})();
