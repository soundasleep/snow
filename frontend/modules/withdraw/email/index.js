var template = require('./index.html')
, format = require('util').format
, _ = require('lodash')
, num = require('num')
, nav = require('../nav')

module.exports = function() {
    var $el = $('<div class="withdraw-email">').html(template())
    , controller = {
        $el: $el
    }
    , $transferForm = $el.find('.transfer-form')
    , $email = $transferForm.find('.email')
    , $amount = $transferForm.find('.amount')
    , $transferButton = $transferForm.find('.submit')
    , $sendForm = $el.find('.send-form')
    , $sendButton = $sendForm.find('.submit')

    // Add currencies
    _.each(api.currencies.value, function(c) {
        if (c.id == 'NOK') return
        var html = format('<option value="%s">%s</option>', c.id, c.id)
        $transferForm.field('currency').append(html)
    })

    function validateEmail() {
        var val = $transferForm.field('email').val()
        return $email
        .toggleClass('has-error', !/^\S+@\S+$/.exec(val))
        .hasClass('error')
    }

    function validateAmount() {
        var val = numbers.parse($transferForm.field('amount').val())
        , currency = _.find(api.currencies.value, {
            id: $transferForm.field('currency').val()
        })
        , precision = val ? num(val).get_precision() : null
        , empty = !val
        , invalidNumber = empty || !val || val < 0
        , precisionTooHigh = !invalidNumber && precision > currency.scale

        return $amount
        .toggleClass('has-error', empty || invalidNumber || precisionTooHigh)
        .hasClass('error')
    }

    $transferForm.on('change', '.field', function() {
        $(this).closest('.form-group').removeClass('is-error')
    })

    $transferForm.on('submit', function(e) {
        e.preventDefault()

        $transferForm.find('.field').blur()

        validateEmail()
        validateAmount()

        if ($transferForm.find('.has-error').length) {
            $transferForm.find('.has-error:first').find('.field:first').focus()
            $transferButton.shake()
            return
        }

        $transferForm.find('.field').enabled(false)
        $transferButton.loading(true, 'Sending...')

        api.sendToUser($transferForm.field('email').val(),
            numbers.parse($transferForm.field('amount').val()),
            $transferForm.field('currency').val())
        .always(function() {
            $transferButton.loading(false)
        })
        .fail(function(err) {
            $transferButton.enabled(true)

            $transferForm.find('.field').enabled(true)

            if (err.name == 'CannotTransferToSelf') {
                $email.addClass('has-error')
                .find('.help-block')
                .html('Cannot send to self')
                $email.find('.field').focus()
                return
            }

            if (err.name == 'UserNotFound') {
                $sendForm.show()
                .find('.email')
                .html($transferForm.field('email').val())

                $transferButton.enabled(false)
                return
            }

            errors.alertFromXhr(err)
        })
        .done(function() {
            showConfirmation(format('You sent %s %s to %s',
                $transferForm.field('amount').val(),
                $transferForm.field('currency').val(),
                $transferForm.field('email').val()))
        })
    })

    function showConfirmation(msg) {
        var $sendConfirmed = $el.find('.send-confirmed').show()
        , $confirmation = $sendConfirmed.find('.confirmation')

        $confirmation.html(msg)
    }

    $sendForm.on('submit', function(e) {
        e.preventDefault()

        $sendButton.loading(true)

        api.sendToUser($transferForm.field('email').val(),
            numbers.parse($transferForm.field('amount').val()),
            $transferForm.field('currency').val(),
            true)
        .always(function() {
            $sendButton.loading(false)
        })
        .fail(function(err) {
            errors.alertFromXhr(err)
        })
        .done(function() {
            $sendButton.enabled(false)
            showConfirmation(format('You sent %s %s to %s',
                $transferForm.field('amount').val(),
                $transferForm.field('currency').val(),
                $transferForm.field('email').val()))
        })
    })

    $el.on('click', 'a[href="#withdraw/email"]', function() {
        router.reload()
    })

    $transferForm.field('email').focusSoon()

    $el.find('.withdraw-nav').replaceWith(nav('email').$el)

    return controller
}
