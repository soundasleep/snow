module.exports = function(router, master, authorize) {
    return router
    .add(/^account$/, function() {
        if (!authorize.user()) return
        router.go('account/funds')
    })
    .add(/^account\/funds$/, function() {
        if (!authorize.user()) return
        master(require('./funds')(), 'account')
    })
    .add(/^account\/activity$/, function() {
        if (!authorize.user()) return
        master(require('./activity')(), 'account')
    })
    .add(/^account\/bankaccounts$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./bankaccounts')(), 'account')
    })
    .add(/^account\/changepassword$/, function() {
        if (!authorize.user()) return
        master(require('./changepassword')(), 'account')
    })
    .add(/^account\/apikeys$/, function() {
        master(require('./apikeys')(), 'account')
    })
}
