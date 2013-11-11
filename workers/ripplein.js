var ripplelib = require('ripple-lib')
, assert = require('assert')
, _ = require('lodash')
, debug = require('debug')('snow:ripple-in')
, async = require('async')
, EventEmitter = require('events').EventEmitter
, util = require('util')
, num = require('num')

module.exports = function(opts) {
    _.bindAll(this)
    _.extend(this, {
    }, opts)

    this.ripple = new ripplelib.Remote({
        trusted: true,
        local_signing: true,
        local_fee: true,
        fee_cusion: 1.5,
        servers: [
            {
                host: 's1.ripple.com',
                port: 443,
                secure: true
            }
        ],
        trace: false && require('debug')('ripple').enabled
    })
    this.ripple.set_secret(this.account, this.secret)
    this.ripple.on('subscribed', this.rippleSubscribed)
    this.ripple.on('ledger_closed', this.rippleLedgerClosed)
    this.ripple.on('state', this.rippleState)
}

util.inherits(module.exports, EventEmitter)

var RippleIn = module.exports.prototype

RippleIn.rippleState = function(state) {
    debug('state: %s', state)

    if (state == 'offline') {
        debug('disconnected from ripple. reconnect in 5 sec')
        this.live = false
        setTimeout(this.ripple.connect, 5e3)
    }
}

RippleIn.rippleLedgerClosed = function(message) {
    debug('ledger %s closed', message.ledger_index)
    if (!this.live) return debug('ignoring ledger close when not live')

    this.internalLedgerIndex = message.ledger_index

    // There is no need to save every ledger index to the database
    if (message.ledger_index % 25 > 0) return

    debug('saving ledger internal index as %s', this.internalLedgerIndex)

    this.conn.query({
        text: [
            'UPDATE ripple_account',
            'SET ledger_index = $1'
        ].join('\n'),
        values: [message.ledger_index]
    }, function(err) {
        if (!err) return debug('saved ledger index as %s', message.ledger_index)
        console.error('failed to save internal ledger index: %s\n', err.message, err.stack)
    })
}

RippleIn.init = function() {
    var that = this

    // Subscribe to incoming transactions
    debug('subscribing...')
    var rippleAccount = this.ripple.add_account(this.account)
    rippleAccount.on('transaction-inbound', this.rippleTransaction)

    async.series({
        currencies: this.cacheCurrencies,

        internal: function(cb) {
            // Retrieve internal ledger index to allow for initial catchup
            that.getInternalLedgerIndex(function(err, index) {
                if (err) return cb(err)
                debug('internal ledger index retrieved, %s', index)
                that.internalLedgerIndex = index

                that.ripple.connect()
            })
        }
    }, function(err) {
        if (err) that.emit('error', err)
    })
}

RippleIn.rippleSubscribed = function() {
    var that = this
    debug('catching up from %s', this.internalLedgerIndex)
    this.live = null

    async.waterfall([
        function(cb) {
            that.ripple.request_account_tx({
                account: that.account,
                ledger_index_min: that.internalLedgerIndex
            }, cb)
        },

        function(res, cb) {
            debug('catching up with %s transactions', res.transactions.length)
            async.forEachSeries(res.transactions, that.rippleTransaction, cb)
        }
    ], function(err) {
        if (err) return that.emit(err)
        if (that.live === false) return debug('disconnected while catching up')
        that.live = true
        debug('caught up and now live')
    })
}

RippleIn.getInternalLedgerIndex = function(cb) {
    var query = 'SELECT ledger_index FROM ripple_account'
    this.conn.query(query, function(err, dr) {
        cb(err, err ? null : dr.rows[0].ledger_index)
    })
}

RippleIn.cacheCurrencies = function(cb) {
    var that = this
    , query = 'SELECT currency_id, scale FROM "currency"'
    this.conn.query(query, function(err, dr) {
        if (err) return cb(err)
        var currencies = dr.rows
        that.currencies = currencies.reduce(function(p, c) {
            p[c.currency_id] = { scale: c.scale }
            return p
        }, {})
        cb()
    })
}

RippleIn.rippleCredit = function(hash, currencyId, tag, amount, cb) {
    console.log('Ripple crediting user with tag %s %s %s (tx %s)', tag,
        num(amount, this.currencies[currencyId].scale).toString(), currencyId, hash)

    this.conn.query({
        text: 'SELECT ripple_credit($1, $2, $3, $4) tid',
        values: [hash, currencyId, tag, amount]
    }, function(err, dr) {
        if (err) {
            // Already credited
            if (err.message.match(/ripple_processed_pkey/)) {
                debug('ignoring duplicate ripple credit')
                return cb()
            }

            // No such user (from destination tag)
            if (err.message.match(/User with tag/)) {
                err = new Error('User does not exist')
                err.name = 'UserNotFound'
                return cb(err)
            }

            return cb(err)
        }

        console.log('Credited %s, internal transaction id %s', hash, dr.rows[0].tid)

        cb(null, dr.rows[0].tid)
    })
}

RippleIn.stringToUnits = function(amount, currencyId) {
    var currency = this.currencies[currencyId]
    if (!currency) throw new Error('currency ' + currencyId + ' not found')
    var n = num(amount).mul(Math.pow(10, currency.scale))
    if (+n % 1 !== 0) throw new Error('precision too high on ' + n.toString())
    return n.toString().replace(/\.0+$/, '')
}

// Marks the transaction as processed. The returned parameter stores
// whether the transaction was to be returned to sender.
RippleIn.markProcessed = function(hash, returned, cb) {
    debug('marking %s as processed %sreturned', hash, returned ? '' : 'NOT ')

    this.conn.query({
        text: [
            'INSERT INTO ripple_processed (hash, returned)',
            'VALUES ($1, $2)'
        ].join('\n'),
        values: [hash, !!returned]
    }, function(err) {
        if (err) {
            if (err.message.match(/ripple_processed_pkey/)) {
                debug('transaction %s has already been processed', hash)
                return cb(null, false)
            }

            return cb(err)
        }

        cb(null, true)
    })
}

// Return the specified transaction to its sender
RippleIn.returnToSender = function(tran, cb) {
    var that = this
    debug('returning %s to sender %s', tran.hash, tran.Account)

    that.markProcessed(tran.hash, true, function(err, res) {
        if (err) {
            console.error('failed to return %s to sender', tran.hash)
            console.error(err.message)
            return cb && cb(err)
        }

        if (!res) {
            debug('will not return duplicate transaction %s', tran.hash)
            return cb && cb(null, false)
        }

        var to = tran.Account
        if (tran.SourceTag) to += ':' + tran.SourceTag

        that.ripple.transaction(
            that.account,
            to,
            tran.Amount,
            function(err) {
                if (!err) return cb && cb(null, true)
                console.error('failed to return %s to sender: %s', tran.hash, err.message)
                cb(err)
            }
        )
    })
}

RippleIn.tryReturnToSender = function(tran, cb) {
    var that = this

    that.returnToSender(tran, function(err, returned) {
        if (err) {
            err = new Error(util.format('Failed to return %s to sender: %s\n%s', tran.hash, err.message, err.stack))
            that.emit(err)
        } else if (returned) {
            console.log('Returned %s to sender', tran.hash)
        } else {
            debug('Did not return %s to sender (duplicate)', tran.hash)
        }

        cb && cb()
    })
}

// Process a transation. The format differs slightly between transaction-inbound
// and the result from account_tx (transaction field or tx field)
RippleIn.rippleTransaction = function(tran, cb) {
    var that = this

    if (tran.meta.TransactionResult != 'tesSUCCESS') {
        debug('ignoring tx with result %s', tran.meta.TransactionResult)
        return cb && cb()
    }

    var inner = tran.transaction || tran.tx
    assert(inner)
    assert(inner.hash)

    assert(inner.TransactionType)
    if (inner.TransactionType != 'Payment') {
        debug('ignoring transaction of type %s', inner.TransactionType)
        return cb && cb()
    }

    assert(inner.Destination)
    if (inner.Destination != this.account) {
        debug('ignoring transaction not to us (%s)', inner.Destination)
        return cb && cb()
    }

    if (inner.DestinationTag === undefined) {
        if (process.env.NODE_ENV == 'production') {
            throw new Error('Cannot receive without destination tag in production')
        }

        debug('ignoring transaction with destination tag when not in production')

        return cb && cb()
    }

    if (inner.DestinationTag == 1) {
        debug('ignoring transaction with tag %s', inner.DestinationTag || '(none)')
        return cb && cb()
    }

    assert(inner.Amount)
    if (inner.Amount.issuer && inner.Amount.issuer != this.account) {
        debug('returning transaction with issuer %s', inner.Amount.issuer)
        return exports.returnToSender(inner, cb)
    }

    //debug('transaction:\n%s', util.inspect(tran))

    var rippleAmount = ripplelib.Amount.from_json(inner.Amount)
    , currency = rippleAmount._currency.to_human()
    , units

    if (currency == 'XRP') {
        assert(typeof inner.Amount == 'string')
        assert(!~inner.Amount.indexOf('.'))
    }

    try {
        var text = rippleAmount.to_text()
        if (currency == 'XRP') {
            text = num(text, 6).toString()
        }
        units = this.stringToUnits(text, currency)
    } catch (e) {
        if (e.message.match(/^precision too high/)) {
            debug('precision of %s (%s) is too high', inner.hash, rippleAmount.to_text())
            return that.tryReturnToSender(inner, cb)
        }

        throw e
    }

    debug('ripple amount %s %s. our units: %s', rippleAmount._currency.to_human(), rippleAmount.to_text(), units)

    that.rippleCredit(
        inner.hash,
        currency,
        inner.DestinationTag,
        units,
        function(err, tid) {
            if (err) {
                if (err.name == 'UserNotFound') {
                    debug('User not found (bad DT). Will return transaction')
                    return that.tryReturnToSender(inner, cb)
                }

                that.emit(err)
                return cb && cb(err)
            }

            cb && cb(null, tid)
        }
    )
}
