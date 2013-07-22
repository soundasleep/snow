var _ = require('lodash')
, template = require('./template.html')
, format = require('util').format
, num = require('num')

module.exports = function() {
    var $el = $('<div class="create-voucher is-creating">').html(template())
    , controller = {
        $el: $el
    }
    , $form = $el.find('.form')
    , $amount = $form.find('.amount')
    , $currency = $form.find('.currency')
    , $submit = $form.find('.submit')

    // Keep up to date on balances
    var balances
    , available

    function onBalancesUpdated(b) {
        b = _.filter(b, function(balance) {
            return ~['BTC', 'XRP', 'LTC'].indexOf(balance.currency)
        })

        if (!balances) {
            $form.field('currency')
            .html($.map(_.sortBy(b, 'currency'), function(balance) {
                return format(
                    '<option value="%s">%s</option>',
                    balance.currency,
                    balance.currency)
            }))
        }

        balances = b
        updateAvailable()
    }

    // Update the user's available in the selected currency
    function updateAvailable() {
        if (!balances) return
        var currency = $form.field('currency').val()
        if (!currency) return
        var balance = _.find(balances, { currency: currency })
        if (!balance) return
        available = balance.available

        $amount.find('.available').html(numbers(available, null, currency))
    }

    api.on('balances', onBalancesUpdated)
    api.balances()

    $form.on('change keyup', '.currency select', updateAvailable)

    // Validation
    function validateAmount(emptyIsError) {
        var amount = $form.field('amount').val()
        $amount.removeClass('error is-invalid is-empty')

        if (!amount.length) {
            $amount.addClass('is-empty')
            if (emptyIsError === true) $amount.addClass('error')
            return
        }

        amount = numbers.parse(amount)

        // NaN or <= 0
        if (+amount <= 0) {
            $amount.addClass('is-invalid error')
            return
        }

        if (_.isUndefined(available)) {
            throw new Error('available is undefined')
        }

        if (num(amount).gt(available)) {
            $amount.addClass('is-invalid error')
            return
        }

        return true
    }

    $amount.on('change keyup', _.bind(validateAmount, this, false))
    $currency.on('change keyup', _.bind(validateAmount, this, false))

    // Submit
    $form.on('submit', function(e) {
        e.preventDefault()

        if (!validateAmount(true)) {
            $form.field('amount').focus()
            $submit.shake()
            return
        }

        $submit.loading(true)

        $form.field('amount')
        .add($form.field('currency'))
        .enabled(false)

        var amount = numbers.parse($form.field('amount').val())
        , currency = $form.field('currency').val()

        api.createVoucher(amount, currency)
        .always(function() {
            $form.field('amount')
            .add($form.field('currency'))
            .enabled(true)
            $submit.loading(false)
        })
        .fail(errors.alertFromXhr)
        .done(function(voucher) {
            var formatted = [
                voucher.substr(0, 4),
                voucher.substr(4, 4),
                voucher.substr(8, 4)
            ].join('-')

            alert('Voucher created: ' + formatted)
            $form.field('amount').val('').focus()
            api.balances()
        })
    })

    controller.destroy = function() {
        api.off('balances', onBalancesUpdated)
    }

    $form.field('amount').focusSoon()

    return controller
}
