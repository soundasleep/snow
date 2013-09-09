var util = require('util')
, _ = require('lodash')
, debug = require('../../../helpers/debug')('verifyemail')
, template = require('./index.html')

module.exports = function(after) {
    var $el = $('<div class=auth-verifyphone>').html(template())
    , controller = {
        $el: $el
    }
    , $callForm = $el.find('form.call')
    , $codeForm = $el.find('form.code')
    , $number = $callForm.find('input[name="phone"]')
    , $country = $callForm.find('select[name="country"]')
    , $code = $codeForm.find('input[name="code"]')
    , number

    // Add countries
    var countries = require('../../../assets/callingcodes.json')
    $country.append(_.map(countries, function(country) {
        return util.format('<option value="%s">%s (%s)</option>',
            country.code, country.name, country.dial_code)
    }))

    // TODO: use user language(s)
    var country = 'US'
    , desired = i18n.desired ? /[a-z]{2}$/i.exec(i18n.desired) : null

    if (desired) {
        country = desired[0].toUpperCase()
        debug('Country from browser language ' + country)
    }

    var options = _.sortBy(_.where(countries, { code: country }), function(x) {
        return x.name.length
    })

    var option = options[0]

    if (option) {
        $country.val(option.code)

        $number.focusSoon()
    } else {
        debug('There is no option that matches the country ' + country)

        $country.focusSoon()
    }

    $callForm.on('submit', function(e) {
        e.preventDefault()

        var code = _.find(countries, { code: $country.val() }).dial_code
        number = $number.val().replace(/[^\d]/g, '')

        if (!number.length) {
            $number.focus()
            $number.shake()
            return
        }

        number = code + number

        var $callButton = $callForm.find('button')
        .loading(true, i18n('verifyphone.calling you'))

        $number.add($country).enabled(false)

        api.call('v1/users/verify/call', { number: number })
        .done(function() {
            setTimeout(function() {
                $codeForm.show()
                $code.focus()
            }, 2500)
        })
        .fail(function(err) {
            if (err.name == 'LockedOut') {
                alertify.alert(
                    'Sorry, but you tried to verify your phone not long ago. ' +
                    'Please try again in a few minutes.',
                    function() {
                        window.location.reload()
                    })
                return
            }

            if (err.name == 'PhoneNumberInUse') {
                alertify.alert(i18n('auth.verifyphone.phone number in use'))
                $callButton.loading(false)
                $number.add($country).enabled(true)
                return
            }

            errors.alertFromXhr(err)
        })
    })

    $codeForm.on('submit', function(e) {
        e.preventDefault()

        var code = $code.val()

        if (!/^\d{4}$/.test(code)) {
            alert('The code should be four digits')
            $code.focus()
            $code.shake()
            return
        }

        $codeForm.find('button')
        .enabled(false)
        .addClass('is-loading')
        .html(i18n('verifyphone.verifying code'))

        $code.enabled(false)

        api.call('v1/users/verify', { code: code })
        .done(function() {
            api.user.phone = number
            api.user.securityLevel = 2
            $app.trigger('verifiedphone', { number: number })
            router.after(after)
        })
        .fail(function(xhr) {
            errors.alertFromXhr(xhr)
            window.location = '/'
        })
    })

    return controller
}
