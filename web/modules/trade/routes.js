module.exports = function(router, master, authorize) {
    return router
    .add(/^trade$/, function() {
        if (!authorize.user()) return
        router.go('trade/BTCNOK/instant/buy')
    })
    .add(/^trade\/orders$/, function() {
        if (!authorize.user()) return
        master(require('./orders')(), 'trade')
    })
    .add(/^trade\/([A-Z]{6})\/(instant|advanced)\/(buy|sell)$/, function(market, mode, type) {
        mode = mode == 'instant' ? 'market' : 'limit'
        type = type == 'buy' ? 'bid' : 'ask'
        master(require('./market')(market, mode, type), 'trade')
    })
}
