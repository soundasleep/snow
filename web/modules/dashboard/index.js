var Activities = require('../activities')
, Withdraws = require('./withdraws')
, format = require('util').format
, _ = require('lodash')

module.exports = function() {
    var template = require('./template.html')
    , controller = {
        $el: $('<div class="dashboard container"></div>').html(template())
    }
    , $balances = controller.$el.find('.balances')
    , $btc = $balances.find('.btc')
    , $ltc = $balances.find('.ltc')
    , $xrp = $balances.find('.xrp')
    , $nok = $balances.find('.nok')
    , activities = Activities()
    , withdraws = Withdraws()
    , $activities = controller.$el.find('.activities')
    , $withdraws = controller.$el.find('.withdraws')
    , $depositXrp = controller.$el.find('.deposit-xrp')
    , $depositBank = controller.$el.find('.deposit-bank')

    $activities.replaceWith(activities.$el)
    $withdraws.replaceWith(withdraws.$el)

    $depositBank.on('click', function(e) {
        e.preventDefault()
        window.location.hash = '#depositbank'
    })

    function balancesUpdated(balances) {
        var dict = _.reduce(balances, function(p, c) {
            p[c.currency] = c
            return p
        }, {})

        $btc.find('.available').html(numbers.format(dict['BTC'].available, 2, 'BTC'))
        $ltc.find('.available').html(numbers.format(dict['LTC'].available, 2, 'LTC'))
        $xrp.find('.available').html(numbers.format(dict['XRP'].available, 2, 'XRP'))
        $nok.find('.available').html(numbers.format(dict['NOK'].available, 2, 'NOK'))
    }

    api.on('balances', balancesUpdated)
    api.balances()

    api.rippleAddress().done(function(address) {
        $depositXrp.attr('href', format('https://ripple.com//send?to=%s&dt=%s',
            address, api.user.tag))
    })

    controller.destroy = function() {
        api.off('balances', balancesUpdated)
    }

    return controller
}
