module.exports = function(router, master, authorize) {
    return router
    .add(/^account$/, function() {
        if (!authorize.user()) return
        router.go('account/funds')
    })
    .add(/^account\/funds$/, function() {
        if (!authorize.user()) return
        master(require('./funds')())
    })
    .add(/^account\/activity$/, function() {
        if (!authorize.user()) return
        master(require('./activity')())
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
        master(require('./apiKeys')())
    })
}
