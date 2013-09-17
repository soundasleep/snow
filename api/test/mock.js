var _ = require('lodash')
, assert = require('assert')
, debug = require('debug')('snow:test')

module.exports = exports = function(target, name, fake) {
    assert(target, 'target is null')
    var real = target[name]
    , wrapper = function() {
        wrapper.invokes++
        return fake ? fake.apply(this, arguments) : null
    }

    wrapper.real = real
    wrapper.invokes = 0
    wrapper.restore = function() {
        target[name] = real;
        delete wrapper.restore;
        delete wrapper.real
    }

    target[name] = wrapper
    return wrapper
}

exports.once = function(target, name, fake) {
    var wrapper = exports(target, name, function() {
        var result = fake ? fake.apply(this, arguments) : null
        wrapper.restore()
        return result
    })
    return wrapper
}

exports.impersonate = function(app, uid, permissions, key) {
    debug('impersonating as user %s with permissions %j', uid, permissions)

    return exports(app.security.demand, 'lookup', function(req, res, cb) {
        cb(null, _.extend({
            id: uid,
            level: permissions ? permissions.level || 0 : 0,
            key: key || null
        }, _.pick(permissions, 'canTrade', 'canDeposit', 'canWithdraw', 'admin', 'primary')))
    })
}

exports.rows = function(rows) {
    rows || (rows = [])

    if (!_.isArray(rows)) {
        return exports.rows([rows])
    }

    return {
        rowCount: rows.length,
        rows: rows
    }
}
