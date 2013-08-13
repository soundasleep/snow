var _ = require('lodash')
, template = require('./index.html')
, format = require('util').format

module.exports = function() {
    var $el = $('<div class="top">').html(template())
    , controller = {
        $el: $el
    }
    , balancesTimer

    function balancesChanged(balances) {
        var fiats = _.filter(balances, function(x) {
            return ~['NOK'].indexOf(x.currency)
        })

        var digitals = _.filter(balances, function(x) {
            return ~['BTC', 'LTC', 'XRP'].indexOf(x.currency)
        })

        var $fiats = $el.find('.fiat .dropdown-menu li')
        , $fiat = $el.find('.fiat-balance')
        , $digitals = $el.find('.digital .dropdown-menu li')
        , $digital = $el.find('.digital-balance')

        $fiats.html($.map(fiats, function(item) {
            return format('<a>%s</a>',
                numbers.format(item.available, { currency: item.currency }))
        }))

        $digitals.html($.map(digitals, function(item) {
            return format('<a>%s</a>',
                numbers.format(item.available, { currency: item.currency }))
        }))

        var fiat = _.find(fiats, { currency: 'NOK' })
        , digital = _.find(digitals, { currency: 'BTC' })

        $fiat.html(numbers.format(fiat.available, { currency: fiat.currency }))
        $digital.html(numbers.format(digital.available, { currency: digital.currency }))
    }

    api.on('balances', function(balances) {
        balancesChanged(balances)
        balancesTimer && clearTimeout(balancesTimer)
        balancesTimer = setTimeout(api.balances, 30e3)
    })

    api.on('user', function(user) {
        $el.find('.user-name').html(user.firstName || user.email)
        api.balances()
    })

    controller.destroy = function() {
        balancesTimer && clearTimeout(balancesTimer)
    }

    return controller
}
