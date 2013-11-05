module.exports = function(router, master, authorize) {
    return router
    .add(/^settings$/, function() {
        router.go('settings/profile', true)
    })
    .add(/^settings\/changepassword$/, function() {
        if (!authorize.user()) return
        master(require('./changepassword')(), 'settings')
    })
    .add(/^settings\/profile$/, function() {
        if (!authorize.user()) return
        master(require('./profile')(), 'settings')
    })
    .add(/^settings\/twofactor$/, function() {
        if (!authorize.user()) return
        master(require('./twofactor')(), 'account')
    })
}
