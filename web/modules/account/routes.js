module.exports = function(router, master, authorize) {
    return router
    .add(/^account\/deposit\/btc$/, function() {
        if (!authorize.user()) return
        master(require('./deposit/btc')())
    })
    .add(/^account\/deposit\/ltc$/, function() {
        if (!authorize.user()) return
        master(require('./deposit/ltc')())
    })
    .add(/^account\/deposit\/btc$/, function() {
        if (!authorize.user()) return
        master(require('./deposit/btc')())
    })
    .add(/^account\/deposit\/bank$/, function() {
        if (!authorize.user()) return
        master(require('./deposit/bank')())
    })
    .add(/^account\/withdraw\/([a-z]+)$/, function(type) {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./withdraw')(type))
    })
}
