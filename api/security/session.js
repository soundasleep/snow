var debug = require('debug')('snow:security:session')
, crypto = require('crypto')
, inspect = require('util').inspect
, assert = require('assert')

module.exports = exports = function(app) {
    exports.app = app
    exports.sessions = {}
    app.use(exports.handler)
    return exports
}

exports.sessionTimeout = 15 * 60e3

// Extract and validate session, if present
exports.handler = function(req, res, next) {
    if (!req.cookies.session) return next()

    exports.lookup(req.cookies.session, function(err, session) {
        if (err) return next(err)
        if (!session) {
            return res.send(401, {
                name: 'SessionNotFound',
                message: 'The specified session could not be found'
            })
        }
        req.session = session

        exports.app.security.users.fromUserId(session.userId, function(err, user) {
            if (err) return next(err)
            assert(user)
            req.user = user
            debug('session %s attached (user #%d)', session.id.substr(0, 4), user.id)
            next()
        })
    })
}

function pretty(id) {
    return id.substr(0, 4)
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

// Note: Async for consistency
exports.lookup = function(key, cb) {
    debug('looking for session key %s in %s', key.substr(0, 4),
        Object.keys(exports.sessions).map(function(x) {
            return x.substr(0, 4)
        }).join())

    var session = exports.sessions[key]

    if (!session) return cb()

    if (session.expires < +new Date()) {
        debug('session with key %s expired during lookup', pretty(key));
        delete exports.sessions[key]
        return cb()
    }

    debug('lookup successful for session with key %s: %s', pretty(key), inspect(session))

    cb(null, session)
}

exports.create = function(email, cb) {
    debug('finding user %s to create session', email)
    exports.app.security.users.fromEmail(email, function(err, user) {
        if (err) return cb(err)

        var sessionId = exports.randomSha256()

        if (user) {
            assert(user.primaryKey)
            debug('creating session key with user pk %s', user.primaryKey)
            var key = exports.getSessionKey(sessionId, user.primaryKey)

            exports.sessions[key] = {
                id: sessionId,
                expires: +new Date() + exports.app.security.session.sessionTimeout,
                nonce: 0,
                userId: user.id
            }

            debug('created session %s with key %s', sessionId.substr(0, 4),
                key.substr(0, 4))
        } else {
            debug('created fake session %s', sessionId.substr(0, 4))
        }

        cb(null, sessionId)
    })
}

exports.getSessionKey = function(sid, key) {
    var hash = crypto.createHash('sha256')
    hash.update(sid)
    hash.update(key)
    var res = hash.digest('hex')
    debug('created skey %s from sid %s + ukey %s',
        pretty(res), pretty(sid), pretty(key))
    return res
}

exports.randomSha256 = function() {
    var hash = crypto.createHash('sha256')
    hash.update(crypto.randomBytes(8))
    return hash.digest('hex')
}

exports.remove = function(skey, cb) {
    exports.lookup(skey, function(err, session) {
        if (err) return cb(err)
        if (!session) return cb(new Error('Session not found'));
        delete exports.app.security.session.sessions[skey];
        debug('session with key %s removed', skey)
        cb()
    })
}
