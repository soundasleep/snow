module.exports = exports = function(app) {
    exports.app = app
    return exports
}

exports.cache = {}

exports.invalidate = function() {
    throw new Error('not implemented')
}

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
