var debug = require('./util/debug')('snow:entry')

debug('initializing shared components')

window.$app = $('body')
window.router = require('./util/router')
window.api = require('./api')
window.errors = require('./errors')
window.i18n = require('./i18n')
window.numbers = require('./util/numbers')
window.notify = require('./util/notify')()
window.formatters = require('./util/formatters')

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

api.bootstrap().done(function() {
    var apiKey = $.cookie('apiKey')

    var master = require('./modules/master')
    master.render()

    if (apiKey) {
        debug('using cached credentials')
        api.loginWithKey(apiKey)
        .done(router.now)
    } else {
        debug('no cached credentials')

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
