let main = require('../lib/utils.js');
let { before, after } = require('sdk/test/utils');
let prefService = require('sdk/preferences/service');

exports.testupdatePref = function(assert) {
    let testString = 'mozilla86-value-new-1';

    // ensure that the before function set the initial value
    assert.equal(prefService.get('distribution.id'), 'mozilla86', 'Initial value should be mozilla86');

    //update the above pref
    main.updatePref('-value-new-1');

    assert.equal(prefService.get('distribution.id'), testString, 'Pref should match updated value');
};

before(exports, function () {
    prefService.set('distribution.id', 'mozilla86');
});

after(exports, function () {
    prefService.set('distribution.id', 'mozilla86');
});

require('sdk/test').run(exports);
