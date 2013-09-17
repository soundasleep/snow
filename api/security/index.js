module.exports = function(app) {
    exports.session = require('./session')(app)
    exports.users = require('./users')(app)
    exports.keys = require('./keys')(app)
    exports.tfa = require('./tfa')(app)
    exports.demand = require('./demand')(app)
    return exports
}

exports.invalidate = function(what) {
    if (typeof what == 'number') {
        Object.keys(exports.session.sessions, function(sid) {
            if (exports.session.sessions[sid].id == what) {
                exports.invalidate(sid)
            }
        })

        Object.keys(exports.keys.cache, function(key) {
            if (exports.keys.cache[key].id == what) {
                exports.invalidate(key)
            }
        })

        return
    }

    delete exports.session.sessions[what];
    delete exports.keys.cache[what];
}
