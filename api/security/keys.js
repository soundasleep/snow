var assert = require('assert')
, debug = require('debug')('snow:security:keys')

module.exports = exports = function(app) {
    exports.app = app
    app.use(exports.keyHandler)
    return exports
}

exports.cache = {}

exports.lookup = function(key, cb) {
    var item = exports.cache[key]

    if (item === undefined) {
        return exports.app.security.users.fromKey(key, function(err, user) {
            if (err) return cb(err)
            exports.cache[key] = user
            exports.lookup(key, cb)
        })
    }

    cb(null, item)
}

exports.keyHandler = function(req, res, next) {
    if (!req.query.key) return next()
    exports.lookup(req.query.key, function(err, key) {
        if (err) return next(err)
        if (!key) {
            return res.send(401, {
                name: 'ApiKeyNotFound',
                message: 'API key not found'
            })
        }
        req.apikey = key
        exports.app.users.lookup(key.userId, function(err, user) {
            if (err) return next(err)
            assert(user)
            req.user = user
            debug('api key %s attached (user #%d)', key.id.substr(0, 10), user.id)
            next()
        })
    })
}
