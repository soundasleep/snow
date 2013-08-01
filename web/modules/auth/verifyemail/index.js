var debug = require('../../../util/debug')('verifyemail')
, template = require('./index.html')

module.exports = function() {
    var $el = $('<div class=auth-verifyemail>').html(template({
        email: api.user.email
    }))
    , controller = {
        $el: $el
    }
    , timer

    $el.on('click', '.send', function(e) {
        e.preventDefault()

        $(e.target)
        .loading(true)
        .html(i18n('verifyemail.send button.sending', api.user.email))

        api.call('v1/email/verify/send', {}, { type: 'POST' })
        .fail(errors.alertFromXhr)
        .done(function() {
            $(e.target)
            .toggleClass('btn-success btn-primary')
            .loading(false)
            .enabled(false)
            .html(i18n('verifyemail.send button.waiting', api.user.email))

            timer = setInterval(function() {
                api.call('v1/whoami')
                .fail(function(err) {
                    debug('failed to whoami for email check')
                    debug(err)
                })
                .done(function(u) {
                    if (!u.emailVerified) return
                    api.user.emailVerified = true
                    clearInterval(timer)
                    $el.modal('hide')
                })
            }, 5e3)
        })
    })

    return controller
}
