/* global -api */
var _ = require('lodash')
, sjcl = require('./vendor/sjcl')
, emitter = require('./helpers/emitter')
, api = module.exports = emitter()
, callingCodes = require('./assets/callingcodes.json')
, debug = require('./helpers/debug')('snow:api')

function sha256(s) {
    var bits = sjcl.hash.sha256.hash(s)
    return sjcl.codec.hex.fromBits(bits)
}

function keyFromCredentials(sid, email, password) {
    return sha256(sid + sha256(email + password))
}

function formatQuerystring(qs) {
    var params = _.map(qs, function(v, k) {
        if (v === null) return null
        if (_.isString(v) && !v.length) return k
        return k + '=' + encodeURIComponent(v)
    })

    params = _.filter(params, function(x) {
        return x !== null
    })

    return params.length ? '?' + params.join('&') : ''
}

api.call = function(method, data, options) {
    var settings = {
        url: '/api/' + method
    }

    options = options || {}
    options.qs = options.qs || {}

    if (options.type) settings.type = options.type
    else if (data) settings.type = 'POST'

    if (data) {
        settings.contentType = 'application/json; charset=utf-8'
        settings.data = JSON.stringify(data)
    }

    if (_.size(options.qs)) {
        settings.url += formatQuerystring(options.qs)
    }

    var xhr = $.ajax(settings)
    xhr.settings = settings

    return xhr
    .then(null, function(xhr, statusText, status) {
        var body = errors.bodyFromXhr(xhr)

        var error = {
            xhr: xhr,
            xhrOptions: options,
            body: body,
            statusText: statusText,
            status: status,
            name: body && body.name ? body.name : null,
            message: body && body.message || null
        }

        return error
    }).fail(function(err) {
        if (~['OtpRequired', 'UnknownApiKey', 'SessionNotFound'].indexOf(err.name)) {
            if (!options.authorizing && api.user) {
                debug('invalidating "session" because of %s', err.name)
                api.logout()
                require('./authorize').demand(0)
                return
            }
        }

        return err
    })
}

api.loginWithKey = function(key) {
    if (key) {
        debug('logging in with key %s', key)
        $.cookie('session', key)
    }

    return api.call('v1/whoami', null, { authorizing: true })
    .then(function(user) {
        $.cookie('existingUser', true, { path: '/', expires: 365 * 10 })

        api.user = user

        api.user.countryFriendly = function() {
            if (!user.country) return null
            var item = _.find(callingCodes, { code: user.country })
            return item ? item.name : 'Unknown'
        }

        api.trigger('user', user)

        $app.addClass('is-logged-in')
        .addClass('is-user-country-' + (api.user.country || 'unknown'))
    })
}

api.logout = function() {
    debug('logging out')

    api.user = null

    if ($.cookie('session')) {
        return api.call('security/session', null, { type: 'DELETE' })
        .always(function() {
            $.removeCookie('session')
        })
    }

    return $.Deferred().resolve()
}

api.login = function(email, password) {
    debug('creating session for %s', email)
    return api.call('security/session', { email: email })
    .then(function(res) {
        debug('retrieved session id: %s', res.id)
        var key = keyFromCredentials(res.id, email, password)
        return api.loginWithKey(key)
    })
}

api.twoFactor = function(email, password, otp) {
    return api.call('v1/twoFactor/auth', {
        otp: otp
    }).then(function() {
        return api.loginWithKey()
    })
}

api.register = function(email, password) {
    return api.call('v1/users', {
        email: email,
        key: keyFromCredentials(email, password)
    })
    .then(function() {
        return api.login(email, password)
    })
}

api.balances = function() {
    return api.call('v1/balances')
    .done(function(balances) {
        api.balances.current = balances
        api.trigger('balances', balances)
    })
}

api.currencies = function() {
    return api.call('v1/currencies')
    .done(function(currencies) {
        api.currencies.value = currencies
        api.trigger('currencies', currencies)
    })
}

api.bootstrap = function() {
    return $.when(
        api.currencies(),
        api.markets()
    ).done(function() {
        $app.removeClass('is-loading')
    })
}

api.sendToUser = function(email, amount, currency, allowNewUser) {
    return api.call('v1/send', {
        email: email,
        amount: amount,
        currency: currency,
        allowNewUser: allowNewUser
    })
}

api.resetPasswordEnd = function(email, phoneCode, newPassword) {
    var key = sha256(email.toLowerCase() + newPassword)
    , body = { email: email, code: phoneCode, key: key }

    return api.call('v1/resetPassword/end', body, { type: 'POST' })
}

api.changePassword = function(newPassword) {
    var newKey = keyFromCredentials(api.user.email, newPassword)
    return api.call('v1/keys/replace', { key: newKey })
}

api.patchUser = function(attrs) {
    return api.call('v1/users/current', attrs, { type: 'PATCH' })
}

api.markets = function() {
    return api.call('v1/markets')
    .then(function(markets) {
        api.markets.value = markets
        api.trigger('markets', markets)
    })
}

api.depth = function(id) {
    debug('retrieving depth for %s...', id)

    return api.call('v1/markets/' + id + '/depth')
    .then(function(depth) {
        debug('depth retrieved for %s. %s bids, %s asks', id,
            depth.bids.length, depth.asks.length)

        api.depth[id] = depth
        api.trigger('depth', { market: id, depth: depth })
        api.trigger('depth:'+ id, depth)
    })
}

// curl -H "Content-type: application/json" -X POST \
// -d '{ "amount": "123.45", "currency": "BTC" }' \
// https://api.justcoin.com/v1/vouchers
//
// { "voucher": "A1B2C3E4F5FF" }
api.createVoucher = function(amount, currency) {
    return api.call('v1/vouchers', {
        amount: amount,
        currency: currency
    }).then(function(res) {
        return res.voucher
    })
}

// curl -X POST https://api.justcoin.com/v1/vouchers/A1B2C3E4F5FF/redeem
//
// 200: { "amount": "123.45", "currency": "BTC" }
// 204: (voucher cancelled)
api.redeemVoucher = function(code) {
    return api.call('v1/vouchers/' + code + '/redeem', null, { type: 'POST' })
    .then(function(body, status, xhr) {
        if (xhr.status == 204) {
            return null
        }

        return body
    })
}

api.bitcoinAddress = function() {
    return api.call('v1/BTC/address')
    .then(function(result) {
        return result.address
    })
    .done(function(address) {
        api.bitcoinAddress.value = address
        api.trigger('bitcoinAddress', address)
    })
}

api.litecoinAddress = function() {
    return api.call('v1/LTC/address')
    .then(function(result) {
        return result.address
    })
    .done(function(address) {
        api.trigger('litecoinAddress', address)
    })
}

api.rippleAddress = function() {
    return api.call('v1/ripple/address')
    .then(function(result) {
        return result.address
    })
    .done(function(address) {
        api.trigger('rippleAddress', address)
    })
}

api.activities = function(since) {
    var options = {
        qs: {
        }
    }

    if (since !== undefined) {
        options.qs.since = since
    }

    return api.call('v1/activities', null, options)
    .done(function(items) {
        api.trigger('activities', items)
    })
}

api.bankAccounts = function() {
    return api.call('v1/bankAccounts')
}
