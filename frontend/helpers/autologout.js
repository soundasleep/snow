var debug = require('./debug')('snow:autologout')

module.exports = exports = function() {
    var timer, started

    function restartTimer() {
        if (!api.user) return
        timer && clearTimeout(timer)
        if (started) {
            debug('restarting autologout timer. had %ss left',
                Math.round((30 * 60e3 - (new Date() - started)) / 1e3))
        }
        started = +new Date()
        timer = setTimeout(function() {
            if (!api.user) return
            debug('logging out from inactivity')
            api.logout().done(router.now)
        }, 30 * 60e3)
    }

    $(window).on('hashchange', restartTimer)
    api.on('user', restartTimer)
}
