module.exports = function(router, master, authorize) {
    return router
    .add(/^deposit$/, function() {
        if (!authorize.user()) return
        router.go('deposit/bitcoin')
    })
    .add(/^deposit\/bitcoin$/, function() {
        if (!authorize.user()) return
        master(require('./bitcoin')(), 'deposit')
    })
    .add(/^deposit\/litecoin$/, function() {
        if (!authorize.user()) return
        master(require('./litecoin')(), 'deposit')
    })
    .add(/^deposit\/bank$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./bank')(), 'deposit')
    })
}
