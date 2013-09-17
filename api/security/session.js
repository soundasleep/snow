var _ = require('lodash')
, debug = require('debug')('snow:security:session')
, crypto = require('crypto')
, inspect = require('util').inspect

module.exports = exports = function(app) {
    app.post('/security/session', exports.create)
    app.del('/security/session', exports.remove)

    exports.app = app
    exports.sessions = {}

    return exports
}

exports.sessionTimeout = 15 * 60e3

exports.randomSha256 = function() {
    var hash = crypto.createHash('sha256')
    hash.update(crypto.randomBytes(8))
    return hash.digest('hex')
}

exports.getSessionKey = function(sid, key) {
    var hash = crypto.createHash('sha256')
    hash.update(sid)
    hash.update(key)
    return hash.digest('hex')
}

function pretty(id) {
    return id.substr(0, 10)
}

exports.extend = function(id, cb) {
    exports.lookup(id, function(err, session) {
        if (err) return cb(err)
        if (!session) return cb(new Error('Session not found'))
        debug('extending session %s', pretty(id))
        session.expires = +new Date() + exports.sessionTimeout
        cb()
    })
}

exports.create = function(req, res, next) {
    req.app.security.users.fromEmail(req.body.email, function(err, user) {
        if (err) return next(err)

        var sessionId = exports.randomSha256()

        if (user) {
            var key = exports.getSessionKey(sessionId, user.key)

            exports.sessions[key] = _.extend({
                expires: +new Date() + exports.sessionTimeout,
                nonce: 0
            }, user)

            debug('created session %s with key %s', pretty(sessionId), pretty(key))
        } else {
            debug('created fake session %s', pretty(sessionId))
        }

        return res.send(201, {
            id: sessionId
        })
    })
}

// Note: Async for consistency
exports.lookup = function(id, cb) {
    var session = exports.sessions[id]

    if (!session) return cb()

    if (session.expires < +new Date()) {
        debug('session %s expired during lookup', pretty(id))
        delete exports.sessions[id]
        return cb()
    }

    debug('lookup successful for %s: %s', pretty(id), inspect(session))

    cb(null, session)
}

exports.remove = function(req, res, next) {
    var sessionId = req.cookies.session

    if (!sessionId) {
        return res.send(400, {
            name: 'NoSession',
            message: 'No session cookie was passed'
        })
    }

    exports.lookup(sessionId, function(err, session) {
        if (err) return next(err)
        if (!session) {
            return res.send(404, {
                name: 'SessionNotFound',
                message: 'The specified session was not found'
            })
        }
        delete exports.sessions[sessionId];

        debug('session %s removed', pretty(sessionId))
        res.send(204)
    })
}
