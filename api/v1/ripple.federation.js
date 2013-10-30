var debug = require('debug')('snow:ripple:federation')
, _ = require('lodash')
, request = require('request')
, parseUrl = require('url').parse

var errorMessages = {
    'noSuchUser': 'The supplied user was not found.',
    'noSuchDomain': 'The supplied domain is not served here.',
    'invalidParams': 'Missing or conflicting parameters.',
    'unavailable': 'Service is temporarily unavailable.'
}

module.exports = exports = function(app) {
    exports.app = app
    app.get('/ripple/federation', exports.handler)
}

exports.cache = {}
exports.domainCache = {}

exports.getError = function(name) {
    return {
        result: 'error',
        error: name,
        error_message: errorMessages[name] || 'Unknown error'
    }
}

exports.handler = function(req, res, next) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.exec(req.query.domain)) {
        return res.send(_.extend(exports.getError('invalidParams'), { query: req.query }))
    }

    if (!/$\S+^/.exec(req.query.user)) {
        return res.send(_.extend(exports.getError('invalidParams'), { query: req.query }))
    }

    var domain = req.query.domain.toLowerCase()
    , user = req.query.user.toLowerCase()
    , cacheKey = user + '@' + domain

    var item = exports.cache[cacheKey]
    if (item !== undefined) return res.send(item)

    // The domain name is served directly here
    if (req.query.domain.toLowerCase() == req.app.config.ripple_federation.domain) {
        return exports.fromUser(user, domain, function(err, rec) {
            if (err) return next(err)
            if (!rec) return exports.sendError(req.query, res, 'noSuchUser')
            var result = {
                result: 'success',
                federation_json: {
                    type: 'federation_record',
                    user: user,
                    tag: rec.tag,
                    service_address: req.app.config.ripple_account,
                    domain: domain
                }
            }
            exports.cache[cacheKey] = result
            res.send(result)
        })
    }

    // The domain is not served here
    if (!req.app.config.ripple_federation.forward) {
        return exports.sendError(req.query, res, 'noSuchDomain')
    }

    exports.forward(req.query.user, req.query.domain, function(err, rres) {
        if (err) return next(err)
        exports.cache[cacheKey] = rres
        res.send(rres)
    })
}

exports.fromUser = function(user, cb) {
    var query = {
        text: 'SELECT tag FROM "user" WHERE REPLACE(email_lower, \'@\', \'_\') = $1',
        values: [user]
    }

    exports.app.conn.read.query(query, function(err, dr) {
        if (err) return cb(err)
        if (!dr.rowCount) return cb()
        cb(null, dr.rows[0].tag)
    })
}

exports.lookupDomain = function(domain, cb) {
    var item = exports.domainCache[domain]

    if (item !== undefined) {
        return cb(null, exports.domainCache)
    }

    request({
        url: 'http://' + domain + '/ripple.txt'
    }, function(err, res, data) {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb()

        var match = /\[federation_url\]\n(.[^\n]+)/i.exec(data)
        if (!match) return cb(new Error('Federation url not found'))

        cb(null, parseUrl(match[1]).href)
    })
}

exports.forward = function(user, domain, cb) {
    exports.lookupDomain(domain, function(err, url) {
        if (err) return cb(err)

        if (!url) {
            return cb(null, ({
                result: 'error',
                error: 'noSuchDomain',
                error_message: errorMessages['noSuchDomain']
            })
        }


    })
}
