var debug = require('debug')('snow:security')
, assert = require('assert')

module.exports = function(app) {
    exports.session = require('./session')(app)
    exports.users = require('./users')(app)
    exports.keys = require('./keys')(app)
    exports.tfa = require('./tfa')(app)
    exports.demand = require('./demand')(app)
    return exports
}

exports.invalidate = function(what) {
    debug('invalidating %s', what)

    if (typeof what == 'number') {
        debug('deleting cached user %s (%s)', what,
            ~exports.users.cache[what] ? 'hit' : 'miss')
        delete exports.users.cache[what]
        return
    }

    assert.equal(typeof what, 'string')

    debug('%s is a session? %s. key? %s', what.substr(0, 10),
        !!exports.session.sessions[what],
        !!exports.keys.cache[what]);

    delete exports.session.sessions[what];
    delete exports.keys.cache[what];
}
