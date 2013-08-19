var format = require('util').format

module.exports = function(router, master, authorize) {
    return router
    .add(/^trade$/, function() {
        var mode = $.cookie('tradeMode') || 'instant'
        , market = $.cookie('tradeMarket') ||
            (api.user.country == 'NO' ? 'BTCNOK' : 'BTCEUR')
        , type = $.cookie('tradeType') || 'buy'

        router.go(format('trade/%s/%s/%s', market, mode, type), true)
    })
    .add(/^trade\/orders$/, function() {
        if (!authorize.user()) return
        master(require('./orders')(), 'trade')
    })
    .add(/^trade\/([A-Z]{6})\/(instant|advanced)\/(buy|sell)$/,
        function(market, mode, type)
    {
        if (!authorize.user(2)) return

        $.cookie('tradeMode', mode, { expires: 10 * 356 * 7 })
        $.cookie('tradeMarket', market, { expires: 10 * 356 * 7 })
        $.cookie('tradeType', type, { expires: 10 * 356 * 7 })

        mode = mode == 'instant' ? 'market' : 'limit'
        type = type == 'buy' ? 'bid' : 'ask'
        master(require('./market')(market, mode, type), 'trade')
    })
}
