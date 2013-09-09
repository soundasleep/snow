module.exports = function(router, master, authorize) {
    return router
    .add(/^settings$/, function() {
        router.go('settings/twofactor', true)
    })
    .add(/^settings\/twofactor$/, function() {
        if (!authorize.user()) return
        master(require('./twofactor')(), 'account')
    })
}
