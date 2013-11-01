var debug = require('debug')('snow')
, assert = require('assert')
, request = require('request')
, num = require('num')
, async = require('async')
, Table = require('cli-table')
, Snow = module.exports = function(key, ep, email, keyPrimary) {
    this.url = ep
    debug('using endpoint %s', ep)

    this.key = key
    this.keyPrimary = keyPrimary
    this.email = email
}

function bodyToError(body) {
    assert(body)
    var error = new Error(body.message || body)
    if (body.name) error.name = body.name
    return error
}

Snow.prototype.orders = function(cb) {
    request(this.url + 'orders', {
        json: true,
        qs: {
            key: this.key
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 200) {
            debug('status code %s from orders', res.statusCode)
            debug(JSON.stringify(body))
            return cb(bodyToError(body))
        }
        cb(null, body)
    })
}

Snow.prototype.markets = function(cb) {
    request(this.url + 'markets', {
        json: true
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 200) return cb(bodyToError(body))
        cb(err, body)
    })
}

// Groups depth from array to bids and asks
Snow.prototype.depth = function(market, cb) {
    request(this.url + 'markets/' + market + '/depth', {
        json: true
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 200) return cb(bodyToError(body))
        cb(null, body)
    })
}

Snow.prototype.cancel = function(id, cb) {
    request(this.url + 'orders/' + id, {
        method: 'DELETE',
        json: true,
        qs: {
            key: this.key
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode === 404) return cb(new Error('Order ' + id + ' not found'))
        if (res.statusCode != 204) return cb(bodyToError(body))
        cb()
    })
}

Snow.prototype.cancelAll = function(cb) {
	var me = this
	var orderCancelled = 0;
	this.orders( function(err, orders) {
		if (err) throw err
		if (orders.length == 0){
			cb(null, 0)
			return;
		}
		async.forEach(
				orders,
				function(order, callback) {
					me.cancel(order.id, function(err) {
						if (err) throw err
						debug('Order #%s cancelled', order.id)
						orderCancelled++;
						callback()
					})
				}, 
				function(err) {
					cb(err, orderCancelled)
				}
		);
	})
}

Snow.prototype.order = function(order, cb) {
    request(this.url + 'orders', {
        json: order,
        method: 'POST',
        qs: {
            key: this.key
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 201) return cb(bodyToError(body))
        cb(null, body.id)
    })
}

Snow.prototype.whoami = function(cb) {
    request(this.url + 'whoami', {
        json: true,
        qs: {
            key: this.key
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 200) return cb(bodyToError(body))
        cb(null, body)
    })
}

Snow.prototype.balances = function(cb) {
    request(this.url + 'balances', {
        json: true,
        qs: {
            key: this.key
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 200) return cb(bodyToError(body))
        cb(null, body)
    })
}

Snow.prototype.securitySession = function(cb) {
	
    request(this.url + 'security/session', {
        json: {"email": this.email},
        method: 'POST'
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode !== 201) return cb(bodyToError(body))
        this.sessionKey = body.id;
        cb(null, body.id)
    })
}

Snow.prototype.createTableUser = function(user){
	var table = new Table({
        head: ['Id', 'Email', 'Security Level', 'twoFactor', 'First name', 'Last name', 'Phone', 'Email verified' ],
        colWidths: [4, 24, 14, 12, 16, 16, 16, 16]
    })
    table.push([
                user.id,
                user.email || '',
                user.securityLevel || '',
                user.twoFactor ? 'Yes' : 'No',
                user.firstName || '',
                user.lastName || '',
                user.phone || '',
                user.emailVerified ? 'Yes' : 'No'
            ]);
    return table
}

Snow.prototype.createTableBalances = function(balances){
	var table = new Table({
        head: ['Currency', 'Balance', 'Hold', 'Available'],
        colWidths: [12, 12, 12, 12]
    })

	balances.forEach(function(balance) {
        table.push([
            balance.currency,
            balance.balance,
            balance.hold,
            balance.available
        ])
    })
    
    return table
}

Snow.prototype.createTableMarkets = function(markets){
	var table = new Table({
        head: ['Market', 'Bid', 'Ask', 'Last', 'High', 'Low', 'Volume'],
        colWidths: [8, 12, 12, 12, 12, 12, 12]
    })

    markets.forEach(function(market) {
        table.push([
            market.id,
            market.bid || '',
            market.ask || '',
            market.last || '',
            market.high || '',
            market.low || '',
            market.volume || '0'
        ])
    })
    return table
}

Snow.prototype.createTableOrders = function(orders){
	var table = new Table({
        head: ['#', 'Market', 'Type', 'Volume', 'Price', 'Total'],
        colWidths: [8, 10, 6, 20, 20, 20]
    })

    orders.forEach(function(order) {
        var pair = [order.market.substr(0, 3), order.market.substr(3)]
        table.push([
            order.id,
            order.market,
            order.type.toUpperCase(),
            order.remaining + ' ' + pair[0],
            order.price + ' ' + pair[1],
            num(order.remaining).mul(order.price) + ' ' + pair[1]
        ])
    })
    return table
}