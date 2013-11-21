module.exports = function(router, master, authorize) {
    return router
    .add(/^deposit$/, function() {
        router.go('deposit/bank', true)
    })
    .add(/^deposit\/bitcoin$/, function() {
        if (!authorize.user(3)) return
        master(require('./bitcoin')(), 'deposit')
    })
    .add(/^deposit\/ripple$/, function() {
        if (!authorize.user(3)) return
        master(require('./ripple')(), 'deposit')
    })
    .add(/^deposit\/litecoin$/, function() {
        if (!authorize.user(3)) return
        master(require('./litecoin')(), 'deposit')
    })
    .add(/^deposit\/bank$/, function() {
        if (!authorize.user(2)) return
        master(require('./bank')(), 'deposit')
    })
    .add(/^deposit\/bank\/(USD|EUR|NOK)$/, function(currency) {
        if (!authorize.user(3)) return

        if (currency == 'USD') {
            master(require('./bank/USD')(), 'deposit')
        } else if (currency == 'EUR') {
            master(require('./bank/EUR')(), 'deposit')
        } else if (currency == 'NOK') {
            master(require('./bank/NOK')(), 'deposit')
        }
    })
    .add(/^deposit\/voucher$/, function() {
        if (!authorize.user(3)) return
        master(require('./voucher')(), 'deposit')
    })
    .add(/^([a-z0-9]{12})$/i, function(code) {
        if (!authorize.user(true)) return
        master(require('./voucher')(code), 'redeem-voucher')
    })
}
