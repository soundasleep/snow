module.exports = exports = function(app) {
    exports.app = app
    app.post('/security/session', exports.create)
    app.del('/security/session', exports.remove)
}

exports.create = function(req, res, next) {
    exports.app.security.session.create(req.body.email, function(err, sid) {
        if (err) return next(err)

        res.send(201, {
            id: sid
        })
    })
}

exports.remove = function(req, res, next) {
    if (!req.session) {
        return res.send(400, {
            name: 'NoSession',
            message: 'No session cookie was passed'
        })
    }

    exports.app.security.session.remove(req.cookies.session, function(err) {
        if (err) return next(err)
        res.send(204)
    })
}
