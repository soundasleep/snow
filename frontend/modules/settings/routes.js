module.exports = function(router, master, authorize) {
    return router
    .add(/^settings$/, function() {
        router.go('settings/twofactor', true)
    })
    .add(/^settings\/changepassword$/, function() {
        if (!authorize.user()) return
        master(require('./changepassword')(), 'settings')
    })
    .add(/^settings\/twofactor$/, function() {
        if (!authorize.user()) return
        master(require('./twofactor')(), 'account')
    })
}
