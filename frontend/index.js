var debug = require('./helpers/debug')('snow:entry')

require('./helpers/framekiller')()

debug('initializing shared components')

window.$app = $('body')
window.router = require('./helpers/router')
window.api = require('./api')
window.errors = require('./errors')
window.i18n = require('./i18n')
window.numbers = require('./helpers/numbers')
window.notify = require('./helpers/notify')()
window.formatters = require('./helpers/formatters')
window.moment = require('moment')
window.autologout = require('./helpers/autologout')()

$app.append(window.notify.$el)

debug('shared components inited')

i18n.detect()

require('./helpers/jquery')
require('./routes.js')()

if (window.analytics) {
    require('./segment')
}

api.on('user', function(user) {
    $app.toggleClass('is-logged-in', !!user)
    $app.toggleClass('is-admin', user && user.admin)

    debug('user has changed')

    if (user.language) {
        debug('user has a language, %s, setting it on i18n', user.language)
        i18n.set(user.language)
    }

    if (!user.language && i18n.desired) {
        debug('user has no language, i18n has desired. patching user')

        api.patchUser({ language: i18n.desired })
        .fail(errors.reportFromXhr)
    }

    api.activities()
})

$app.on('click', 'a[href="#set-language"]', function(e) {
    e.preventDefault()
    i18n.set($(this).attr('data-language'))
})

debug('boostrapping...')

api.bootstrap()
.fail(function(err) {
    errors.alertFromXhr(err)

    debug('reloading window after alert (bootstrap failed) in 10 sec')

    setTimeout(function() {
        window.location.reload()
    }, 10e3)
})
.done(function() {
    debug('boostrapping successful')

    var master = require('./modules/master')
    master.render()

    if ($.cookie('session')) {
        debug('using existing session')
        api.loginWithKey()
        .fail(function() {
            $.removeCookie('session')
            debug('failed to reuse existing session')
            router.now()
        })
        .done(router.now)
    } else {
        debug('no existing session')

        if ($.cookie('existingUser')) {
            debug('routing to login (existing user cookie)')
            require('./authorize').user()
        } else {
            debug('routing')
            router.now()
        }
    }

    $(window).on('hashchange', function() {
        $(window).scrollTop(0)

        if (typeof analytics != 'undefined') {
            analytics.pageview()
        }
    })
})
