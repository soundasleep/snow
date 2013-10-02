var _ = require('lodash')
, debug = require('../../../../../helpers/debug')('trade:estimate')

exports.receive = function(market, amount) {
    var receive = 0
    , base = market.substr(0, 3)
    , filled
    if (!api.depth[market].bids) {
        debug('no bids available')
        console.log(api.depth[market])
        return
    }
    amount = +amount
    _.some(api.depth[market].bids, function(level) {
        var price = +level[0]
        , volume = +level[1]
        filled = volume >= amount
        var take = filled ? amount : volume
        amount -= take
        receive += take * price
        debug('%s @ %s (%s). %s remaining', take, price, take * price, amount)
        return amount === 0
    })

    debug('Filled? %s', filled)
    return filled ? receive.toFixed(api.currencies[base].scale) : null
}

exports.summary = function(market, amount, feeRatio) {
    var receive = +exports.receive(market, amount)
    if (receive <= 0) return null
    var quote = market.substr(3)
    , quoteScale = api.currencies[quote].scale
    , fee = receive * feeRatio

    return {
        receive: receive.toFixed(quoteScale),
        fee: fee.toFixed(quoteScale),
        receiveAfterFee: (receive - fee).toFixed(quoteScale),
        price: (receive / amount).toFixed(api.markets[market].scale)
    }
}
