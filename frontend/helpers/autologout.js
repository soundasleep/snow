var debug = require('./debug')('snow:autologout')

module.exports = exports = function() {
    var timer

    function restartTimer() {
        if (!api.user) return
        timer && clearTimeout(timer)
        timer = setTimeout(function() {
            if (!api.user) return
            debug('logging out from inactivity')
            api.logout().done(router.now)
        }, 30 * 60e3)
    }

    $(window).on('hashchange', restartTimer)
    api.on('user', restartTimer)
}
