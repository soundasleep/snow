module.exports = function(router, master, authorize) {
    return router
    .add(/^account\/deposit\/bitcoin$/, function() {
        if (!authorize.user()) return
        master(require('./deposit/bitcoin')())
    })
    .add(/^account\/deposit\/litecoin$/, function() {
        if (!authorize.user()) return
        master(require('./deposit/litecoin')())
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
    .add(/^account\/bankaccounts$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./bankaccounts')())
    })
    .add(/^account\/changepassword$/, function() {
        if (!authorize.user()) return
        master(require('./changepassword')())
    })
    .add(/^account\/apiKeys$/, function() {
        master(require('./apiKeys')(), 'home')
    })
}
