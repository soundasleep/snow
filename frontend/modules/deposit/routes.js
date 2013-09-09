module.exports = function(router, master, authorize) {
    return router
    .add(/^deposit$/, function() {
        router.go('deposit/bank', true)
    })
    .add(/^deposit\/bitcoin$/, function() {
        if (!authorize.user(2)) return
        master(require('./bitcoin')(), 'deposit')
    })
    .add(/^deposit\/litecoin$/, function() {
        if (!authorize.user(2)) return
        master(require('./litecoin')(), 'deposit')
    })
    .add(/^deposit\/bank$/, function() {
        if (!authorize.user(3)) return
        master(require('./bank')(), 'deposit')
    })
    .add(/^deposit\/voucher$/, function() {
        if (!authorize.user(2)) return
        master(require('./voucher')(), 'deposit')
    })
    .add(/^([a-z0-9]{12})$/i, function(code) {
        if (!authorize.user(true)) return
        master(require('./voucher')(code), 'redeem-voucher')
    })
}
