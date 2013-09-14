var debug = require('debug')('snow:tfa')

module.exports = exports = function(app) {
    app.post('/v1/twoFactor/enable', app.security.demand.primary, exports.enable)
    app.post('/v1/twoFactor/remove', app.security.demand.primary, exports.remove)
    app.post('/v1/twoFactor/auth', app.security.demand.primary, exports.auth)
}

exports.remove = function(req, res, next) {
    if (!req.app.validate(req.body, 'v1/twofactor_remove', res)) return

    var twoFactor = req.user.tfaSecret

    if (!twoFactor) {
        return res.send(401, {
            name: 'TwoFactorNotEnabled',
            message: 'Two-factor is not enabled for the user'
        })
    }

    debug('two factor key(secret) %s', twoFactor)

    var correct = req.app.security.tfa.consume(twoFactor, req.body.otp)

    if (correct === null) {
        return res.send(403, {
            name: 'BlockedOtp',
            message: 'Time-based one-time password has been consumed. Try again in 30 seconds'
        })
    }

    if (!correct) {
        return res.send(403, {
            name: 'WrongOtp',
            message: 'Wrong one-time password'
        })
    }

    req.app.conn.write.query({
        text: [
            'UPDATE "user"',
            'SET two_factor = NULL',
            'WHERE user_id = $1 AND two_factor IS NOT NULL'
        ].join('\n'),
        values: [req.user.id]
    }, function(err, dr) {
        if (err) return next(err)

        if (!dr.rowCount) {
            return res.send(400, {
                name: 'TwoFactorNotEnabled',
                message: 'Two-factor authentication is not set for this user'
            })
        }

        req.app.activity(req.user.id, 'RemoveTwoFactor', {})
        req.app.security.invalidate(req.app, req.user.id)

        res.send(204)
    })
}

exports.enable = function(req, res, next) {
    if (!req.app.validate(req.body, 'v1/twofactor_enable', res)) return

    var twoFactor = req.body.key

    debug('two factor key(secret) %s', twoFactor)

    var correct = req.app.security.tfa.consume(twoFactor, req.body.otp)

    if (correct === null) {
        return res.send(403, {
            name: 'BlockedOtp',
            message: 'Time-based one-time password has been consumed. Try again in 30 seconds'
        })
    }

    if (!correct) {
        return res.send(403, {
            name: 'WrongOtp',
            message: 'Wrong one-time password'
        })
    }

    req.app.conn.write.query({
        text: [
            'UPDATE "user"',
            'SET two_factor = $2',
            'WHERE user_id = $1 AND two_factor IS NULL'
        ].join('\n'),
        values: [req.user.id, req.body.key]
    }, function(err, dr) {
        if (err) return next(err)

        if (!dr.rowCount) {
            return res.send(400, {
                name: 'TwoFactorAlreadyEnabled',
                message: 'Two-factor authentication is already set for this user'
            })
        }

        req.app.security.invalidate(req.app, req.user.id)
        req.user.tfaSecret = twoFactor
        req.user.tfaPassed = true
        req.app.activity(req.user.id, 'EnableTwoFactor', {})

        res.send(204)
    })
}

exports.auth = function(req, res) {
    if (!req.app.validate(req.body, 'v1/twofactor_auth', res)) return

    var twoFactor = req.user.tfaSecret

    if (!twoFactor) {
        return res.send(401, {
            name: 'TwoFactorNotEnabled',
            message: 'Two-factor is not enabled for the user'
        })
    }

    debug('two factor key(secret) %s', twoFactor)

    var correct = req.app.security.tfa.consume(twoFactor, req.body.otp)

    if (correct === null) {
        return res.send(403, {
            name: 'BlockedOtp',
            message: 'Time-based one-time password has been consumed. Try again in 30 seconds'
        })
    }

    if (!correct) {
        return res.send(403, {
            name: 'WrongOtp',
            message: 'Wrong one-time password'
        })
    }

    debug('otp is correct, setting tfaPassed on the user')

    req.user.tfaPassed = true

    debug('%j', req.user)

    res.send(204)
}
