module.exports = function(router, master, authorize) {
    return router
    .add(/^settings$/, function() {
        router.go('settings/profile', true)
    })
    .add(/^settings\/changepassword$/, function() {
        if (!authorize.user()) return
        master(require('./changepassword')(), 'settings')
    })
    .add(/^settings\/profile(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user(2)) return
        master(require('./profile')(after), 'settings')
    })
    .add(/^settings\/username$/, function() {
        if (!authorize.user()) return
        master(require('./username')(), 'settings')
    })
    .add(/^settings\/twofactor$/, function() {
        if (!authorize.user()) return
        master(require('./twofactor')(), 'account')
    })
}
