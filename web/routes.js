var master = require('./modules/master')
, login = require('./modules/login')
, register = require('./modules/register')
, notfound = require('./modules/notfound')
, identity = require('./modules/identity')
, resetPassword = require('./modules/resetPassword')
, authorize = require('./authorize')

module.exports = function() {
    router
    .add(/^$/, function() {
        if (api.user) {
            return router.go('account/funds')
        }

        master(login())
    })
    .add(/^resetPassword$/, function() {
        master(resetPassword(), 'resetPassword')
    })
    .add(/^signOut$/, function() {
        $.removeCookie('apiKey')
        window.location = '/'
    })
    .add(/^register(?:\?after=(.+))?$/, function(after) {
        master(register(after), 'register')
    })
    .add(/^login(?:\?after=(.+))?$/, function(after) {
        master(login(after), 'login')
    })
    .add(/^identity(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user()) return
        master(identity(after), 'identity')
    })

    require('./modules/account/routes.js')(router, master, authorize)
    require('./modules/deposit/routes.js')(router, master, authorize)
    require('./modules/withdraw/routes.js')(router, master, authorize)
    require('./modules/trade/routes.js')(router, master, authorize)
    require('./modules/about/routes.js')(router, master, authorize)

    router
    .add(/^(.+)$/, function(hash) {
        master(notfound(hash))
    })
}
