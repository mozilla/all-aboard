let { utils } = require('../lib/utils.js');
let { before, after } = require('sdk/test/utils');
let prefService = require('sdk/preferences/service');

exports.testupdatePref = function(assert) {
    let testString = 'mozilla86-value-new-1';
    let stepTwoTestString = 'mozilla86-value-new-2';

    // ensure that the before function set the initial value
    assert.equal(prefService.get('distribution.id'), 'mozilla86', 'Initial value should be mozilla86');

    //update the above pref
    utils.updatePref('-value-new-1');

    assert.equal(prefService.get('distribution.id'), testString, 'Pref should match updated value');

    // because we have already updated the pref with the
    // (new|existing)/(utility|values) parameters, the below
    // update should not have any effect.
    utils.updatePref('-value-existing');

    assert.equal(prefService.get('distribution.id'), testString, 'Pref should match updated value');

    // update the step we are on
    utils.updatePref(2);

    assert.equal(prefService.get('distribution.id'), stepTwoTestString, 'Pref should have updated to step 2');
};

before(exports, function () {
    prefService.set('distribution.id', 'mozilla86');
});

after(exports, function () {
    prefService.set('distribution.id', 'mozilla86');
});

require('sdk/test').run(exports);
