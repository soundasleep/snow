module.exports = function(router, master, authorize) {
    return router
    .add(/^(?:auth\/)?resetpassword$/, function() {
        master(require('./resetpassword')(), 'resetpassword')
    })
    .add(/^(?:auth\/)?signOut$/, function() {
        if (!authorize.user()) return
        $.removeCookie('apiKey')
        window.location = '/'
    })
    .add(/^(?:auth\/)?register(?:\?after=(.+))?$/, function(after) {
        master(require('./register')(after), 'register')
    })
    .add(/^(?:auth\/)?login(?:\?after=(.+))?$/, function(after) {
        master(require('./login')(after), 'login')
    })
    .add(/^(?:auth\/)?identity(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user()) return
        master(require('./identity')(after), 'identity')
    })
}
