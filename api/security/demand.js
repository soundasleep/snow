var assert = require('assert')
, debug = require('debug')('snow:security:demand')
, format = require('util').format

module.exports = exports = function(app) {
    exports.app = app
    return exports
}

var types = ['any', 'trade', 'deposit', 'withdraw', 'primary', 'admin']
types.forEach(function(type) {
    exports[type] = function(req, res, next) {
        if (typeof req == 'number') {
            return exports.handler.bind(exports, type, req || 0)
        }

        exports.handler(type, 0, req, res, next)
    }
})

exports.demand = function(session, type, level, req, res, next) {
    debug('demanding type %s and level %s', type, level)

    if (session.suspended) {
        return res.send(401, {
            name: 'UserSuspended',
            message: 'The user is suspended. Contact support'
        })
    }

    if (session.primary && session.tfaSecret && !session.tfaPassed &&
        req.path != '/v1/twoFactor/auth')
    {
        debug('session is primary, user has 2fa enabled, but 2fa is not passed')
        debug(req.path)
        return res.send(401, {
            name: 'OtpRequired',
            message: 'Two-factor authentication is required for this account'
        })
    }

    if ((type == 'primary' || type == 'admin') && !session.primary) {
        debug('required type is primary, but session %j', session)

        return res.send(401, {
            name: 'SessionRequired',
            message: 'The action requires an interactive session'
        })
    }

    if (session.level < level) {
        debug('security level %d is lower than required %d', session.level, level)

        return res.send(401, {
            name: 'SecurityLevelTooLow',
            message: 'The user\'s security level is too low'
        })
    }

    if (!~['any', 'primary'].indexOf(type)) {
        var mapping = {
            admin: 'admin',
            trade: 'canTrade',
            withdraw: 'canWithdraw',
            deposit: 'canDeposit'
        }[type]

        assert(mapping, 'mapping not found for type ' + type)

        debug('session %j is missing required permission %s (%s)', session, type, mapping)

        if (!session[mapping]) {
            return res.send(401, {
                name: 'PermissionRequired',
                message: format('The API key does not have the %s permission', type)
            })
        }
    }

    debug('session has %ds left', Math.round((session.expires - new Date()) / 1e3))

    if (session.primary) {
        debug('extending session...')
        exports.app.security.session.extend(req.cookies.session, function(err) {
            if (err) {
                console.error('Failed to extend session:')
                console.error(err)
            }
            debug('session extended')
        })
    }

    next()
}

exports.lookup = function(req, res, cb) {
    if (req.cookies.session) {
        debug('looking up session %s', req.cookies.session.substr(0, 10))
        return exports.app.security.session.lookup(req.cookies.session, cb)
    }

    if (!req.query.key) {
        return res.send(401, {
            name: 'NotAuthenticated',
            message: 'Both API key and session cookie missing'
        })
    }

    exports.app.security.keys.lookup(req.query.key, cb)
}

exports.handler = function(type, level, req, res, next) {
    exports.lookup(req, res, function(err, session) {
        if (err) {
            return next(err)
        }

        if (!session) {
            return res.send(401, {
                name: 'SessionNotFound',
                message: 'Session not found'
            })
        }

        exports.demand(session, type, level, req, res, function(err) {
            if (err) return next(err)

            debug('attaching user #%d to request (from session)', session.id)
            req.user = session

            next()
        })
    })
}
