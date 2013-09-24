var transactions = require('../transactions')
, _ = require('lodash')

module.exports = exports = function(app) {
    app.post('/v1/transactions', app.security.demand.any, exports.index)
    app.get('/v1/transactions/csv', app.security.demand.any, exports.csv)
    exports.app = app
}

exports.query = function(userId, skip, cb) {
    var query = {
        userId: userId,
        sort: {
            timestamp: 'desc'
        },
        limit: 20
    }

    if (skip) {
        query.skip = skip
    }

    transactions.query(exports.app, query, function(err, sr) {
        if (err) return cb(err)

        cb(null, {
            count: sr.count,
            limit: sr.limit,
            transactions: sr.transactions.map(function(tran) {
                return _.extend({
                    amount: tran.creditUserId == userId ? tran.amount : '-' + tran.amount
                }, _.pick(tran, 'id', 'type', 'timestamp', 'date', 'currency'))
            })
        })
    })
}

exports.index = function(req, res, next) {
    var skip = req.body.skip ? +req.body.skip : null
    exports.query(req.user.id, skip, function(err, qres) {
        if (err) return next(err)
        res.send(qres)
    })
}

exports.csv = function(req, res, next) {
    var skip = req.query.skip ? +req.query.skip : null
    exports.query(req.user.id, skip, function(err, qres) {
        if (err) return next(err)

        var csv = [
            ['id', 'type', 'timestamp', 'date', 'currency', 'amount']
        ]

        csv = csv.concat(qres.transactions.map(function(row) {
            return [
                row.id,
                row.type,
                row.timestamp,
                row.date,
                row.currency,
                exports.app.cache.formatCurrency(row.amount, row.currency)
            ]
        }))

        res.header('Content-Type', 'text/csv; name="transactions.csv"')
        res.header('Content-Disposition', 'attachment; filename="transactions.csv"')

        res.send(csv.map(function(row) {
            return row.join(',')
        }).join('\n'))
    })
}
