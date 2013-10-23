module.exports = function(router, master, authorize) {
    return router
    .add(/^(?:auth\/)?resetpassword$/, function() {
        master(require('./resetpassword')(), 'resetpassword')
    })
    .add(/^(?:auth\/)?signOut$/, function() {
        api.logout().done(function() {
            window.location = '/'
        })
    })
    .add(/^(?:auth\/)?register(?:\?after=(.+))?$/, function(after) {
        if (api.user) return router.after(after)
        master(require('./register')(after), 'register')
    })
    .add(/^(?:auth\/)?login(?:\?after=(.+))?$/, function(after) {
        if (api.user) return router.after(after)
        master(require('./login')(after), 'login')
    })
    .add(/^(?:auth\/)?identity(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user()) return
        master(require('./identity')(after), 'identity')
    })
    .add(/^auth\/verifyemail(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user()) return
        master(require('./verifyemail')(after), 'verifyemail')
    })
    .add(/^auth\/verifyphone(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user(1)) return
        if (api.user.phone) return router.after(after)
        master(require('./verifyphone')(after), 'verifyphone')
    })
    .add(/^auth\/norwaydeposit$/, function() {
        if (!authorize.user(3)) return
        master(require('./norwaydeposit')(), 'norwaydeposit')
    })
    .add(/^auth\/cip$/, function() {
        if (!authorize.user(3)) return
        master(require('./cip')(), 'cip')
    })
}
