var transactions = require('../transactions')
, _ = require('lodash')

module.exports = exports = function(app) {
    app.post('/v1/transactions', app.auth.any, exports.index)
}

exports.index = function(req, res, next) {
    var query = {
        userId: req.user,
        sort: {
            timestamp: 'desc'
        },
        limit: 20
    }

    if (req.body.skip) {
        query.skip = +req.body.skip
    }

    transactions.query(req.app, query, function(err, sr) {
        if (err) return next(err)

        res.send({
            count: sr.count,
            limit: sr.limit,
            transactions: sr.transactions.map(function(tran) {
                return _.extend({
                    amount: tran.creditUserId == req.user ? tran.amount : '-' + tran.amount
                }, _.pick(tran, 'id', 'type', 'timestamp', 'date', 'currency'))
            })
        })
    })
}
