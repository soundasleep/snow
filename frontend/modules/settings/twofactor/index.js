var template = require('./index.html')
, nav = require('../nav')
, base32 = require('thirty-two')

function generate_key_ascii(length) {
    var set = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
    , key = ''

    for (var i = 0; i < length; i++) {
        key += set.charAt(Math.floor(Math.random() * set.length))
    }

    return key
}

module.exports = function() {
    var key = generate_key_ascii(20)
    , keyBase32 = base32.encode(key).replace(/=/g, '')

    var $el = $('<div class=settings-twofactor>').html(template({
        secret: keyBase32
    }))
    , controller = {
        $el: $el
    }
    , $disableForm = $el.find('form[name="disable"]')
    , $enableForm = $el.find('form[name="enable"]')

    $el.toggleClass('has-two-factor', api.user.twoFactor)

    $el.find('.settings-nav').replaceWith(nav('twofactor').$el)

    $disableForm.on('submit', function(e) {
        e.preventDefault()

        if (!$disableForm.validate(true)) return

        api.call('v1/twofactor/remove', {
            otp: $disableForm.field('otp').val()
        })
        .fail(function(err) {
            if (err.name == 'WrongOtp') {
                $disableForm.find('.otp').addClass('is-wrong has-error')
                return
            }

            if (err.name == 'BlockedOtp') {
                $disableForm.find('.otp').addClass('is-locked-out has-error')
                return
            }

            errors.alertFromXhr(err)
        })
        .done(function() {
            api.user.twoFactor = false
            router.reload()
        })
    })

    $enableForm.on('submit', function(e) {
        e.preventDefault()

        $enableForm.find('.otp').removeClass('is-locked-out is-wrong')

        if (!$enableForm.validate(true)) return

        api.call('v1/twofactor/enable', {
            key: $enableForm.field('secret').val(),
            otp: $enableForm.field('otp').val()
        })
        .fail(function(err) {
            if (err.name == 'WrongOtp') {
                $enableForm.find('.otp').addClass('is-wrong has-error')
                return
            }

            if (err.name == 'BlockedOtp') {
                $enableForm.find('.otp').addClass('is-locked-out has-error')
                return
            }

            errors.alertFromXhr(err)
        })
        .done(function() {
            api.user.twoFactor = true
            alertify.log(i18n('settings.twofactor.enabled alert'))
            router.go('')
        })
    })

    $el.focusSoon()

    return controller
}
