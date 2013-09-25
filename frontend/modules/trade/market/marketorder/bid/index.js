var num = require('num')
, _ = require('lodash')
, template = require('./index.html')
, debug = require('../../../../../helpers/debug')('trade')
, estimate = require('./estimate')
, balanceLabel = require('../../../../shared/balance')

module.exports = exports = function(market) {
    var base = market.substr(0, 3)
    , quote = market.substr(3, 3)
    , $el = $('<div class="bid">').html(template({
        base: base,
        quote: quote
    }))
    , controller = {
        $el: $el
    }
    , $form = $el.find('form')
    , $amount = $el.find('.amount')
    , $submit = $form.find('button[type="submit"]')
    , depth
    , feeRatio = 0.005
    , quotePrecision = _.find(api.currencies.value, { id: quote }).scale

    function available() {
        return api.balances.current ?
            _.find(api.balances.current, { currency: quote }).available :
            null
    }

    function validateAmount(submitting) {
        $amount.removeClasses(/^(is|has)/)

        var amount = $amount.field().val()
        , validator = $.Deferred()
        .fail(function(code) {
            $amount.addClass('has-error ' + code)
        })

        // Allow empty unless submitting
        if (!amount.length && !submitting) return validator.resolve()

        // Validate format
        amount = numbers.parse(amount)

        if (!amount || amount <= 0) return validator.reject('is-invalid')

        try {
            amount = num(amount)
        } catch (e) {
            return validator.reject('is-invalid')
        }

        // Check for available funds
        if (amount.gt(available())) return validator.reject('has-insufficient-funds')

        var precision = amount.get_precision()
        if (precision > quotePrecision) return validator.reject('is-precision-too-high')

        amount.set_precision(quotePrecision)

        var receive = estimate.receive(market, amount)
        if (!receive) return validator.reject('is-too-deep')

        return validator.resolve(amount.toString())
    }

    function validate(submitting) {
        return validateAmount(submitting)
        .fail(function() {
            if (submitting) {
                $form.find('.has-error:first').field().focus()
                $submit.shake()
            }
        })
        .done(function(amount) {
            amount && summarize()
        })
    }

    function confirm(text) {
        var deferred = $.Deferred()

        alertify.confirm(text, function(ok) {
            deferred.resolve(ok)
        })

        return deferred
    }

    $form.on('submit', function(e) {
        e.preventDefault()

        validate(true)
        .then(function() {
            api.depth(market)
            api.balances()

            var receive = estimate.receive(market, numbers.parse($amount.field().val()))

            var confirmText = i18n(
                'markets.market.marketorder.bid.confirm',
                base,
                numbers($amount.field().parseNumber(), { currency: quote }),
                numbers(receive, { currency: base }))

            return confirm(confirmText)
        })
        .done(function(ok) {
            if (!ok) return

            $submit.loading(true, i18n('markets.market.marketorder.bid.placing order'))
            $form.addClass('is-loading')

            api.call('v1/spend', {
                market: market,
                amount: $amount.field().parseNumber()
            })
            .always(function() {
                $submit.loading(false)
                $form.removeClass('is-loading')
            })
            .fail(function(err) {
                errors.alertFromXhr(err)
            })
            .done(function() {
                $amount.field().focus().val('')

                api.depth(market)
                api.balances()
            })
        })
    })

    function summarize() {
        var $summary = $el.find('.order-summary')
        , amount = numbers.parse($amount.field().val())
        , summary = estimate.summary(market, amount, feeRatio)

        if (!summary) {
            $summary.find('.receive-price').empty()
            $summary.find('.fee').empty()
            $summary.find('.receive-quote').empty('')
            return
        }

        console.log(summary)

        $summary.find('.receive-price').html(summary.price.toString())
        $summary.find('.fee').html(summary.fee.toString())
        $summary.find('.receive-quote').html(summary.receiveAfterFee.toString())
    }

    $el.on('click', '[data-action="spend-all"]', function(e) {
        e.preventDefault()
        $form.field('amount').val(numbers.format(api.balances[quote].available))
    })

    api.on('balances', function() {
        validate()
    })

    api.on('depth:' + market, function(x) {
        depth = x
        debug('re-validating on depth update...')
        validate()
    })

    $amount.field().on('keyup change', function() {
        validate()
    })

    $el.find('.available').replaceWith(balanceLabel({
        currency: quote,
        flash: true
    }).$el)

    return controller
}
