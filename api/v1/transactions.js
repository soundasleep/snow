var transactions = require('../transactions')
, _ = require('lodash')

module.exports = exports = function(app) {
    app.post('/v1/transactions', app.security.demand.any, exports.index)
    app.get('/v1/transactions/csv', app.security.demand.any, exports.csv)
    exports.app = app
}

exports.index = function(req, res, next) {
    var skip = req.body.skip ? +req.body.skip : null
    var query = {
        userId: req.user.id,
        sort: {
            timestamp: 'desc'
        },
        limit: 20,
        skip: skip
    }

    transactions.query(exports.app, query, function(err, sr) {
        if (err) return next(err)

        res.send({
            count: sr.count,
            limit: sr.limit,
            transactions: sr.transactions.map(function(tran) {
                return _.extend({
                    amount: tran.creditUserId == req.user.id ? tran.amount : '-' + tran.amount
                }, _.pick(tran, 'id', 'type', 'timestamp', 'date', 'currency'))
            })
        })
    })
}

exports.csv = function(req, res, next) {
    var query = {
        userId: req.user.id,
        sort: {
            timestamp: 'asc'
        }
    }

    transactions.query(exports.app, query, function(err, sr) {
        if (err) return next(err)

        var csv = [
            ['id', 'type', 'timestamp', 'date', 'currency', 'amount']
        ]

        csv = csv.concat(sr.transactions.map(function(row) {
            return [
                row.id,
                row.type,
                row.timestamp,
                row.date,
                row.currency,
                row.creditUserId == req.user.id ? row.amount : '-' + row.amount
            ]
        }))

        res.header('Content-Type', 'text/csv; name="transactions.csv"')
        res.header('Content-Disposition', 'attachment; filename="transactions.csv"')

        res.send(csv.map(function(row) {
            return row.join(',')
        }).join('\n'))
    })
}
