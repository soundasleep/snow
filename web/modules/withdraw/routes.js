module.exports = function(router, master, authorize) {
    return router
    .add(/^withdraw$/, function() {
        if (!authorize.user()) return
        router.go('withdraw/withdraws')
    })
    .add(/^withdraw\/bitcoin$/, function() {
        if (!authorize.user()) return
        master(require('./bitcoin')(), 'withdraw')
    })
    .add(/^withdraw\/litecoin$/, function() {
        if (!authorize.user()) return
        master(require('./litecoin')(), 'withdraw')
    })
    .add(/^withdraw\/ripple$/, function() {
        if (!authorize.user()) return
        master(require('./ripple')(), 'withdraw')
    })
    .add(/^withdraw\/bank$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./bank')(), 'withdraw')
    })
    .add(/^withdraw\/email$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./email')(), 'withdraw')
    })
    .add(/^withdraw\/ripple$/, function() {
        if (!authorize.user()) return
        master(require('./ripple')(), 'withdraw')
    })
    .add(/^withdraw\/withdraws$/, function() {
        if (!authorize.user()) return
        master(require('./withdraws')(), 'withdraw')
    })
}
