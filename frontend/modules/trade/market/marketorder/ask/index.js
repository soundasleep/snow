var num = require('num')
, template = require('./index.html')
, debug = require('../../../../../helpers/debug')('trade')
, estimate = require('./estimate')
, balanceLabel = require('../../../../shared/balance')

module.exports = function(market) {
    var base = market.substr(0, 3)
    , quote = market.substr(3, 3)
    , feeRatio = market == 'BTCEUR' ? 0 : 0.005
    , $el = $('<div class="ask">').html(template({
        base: base,
        quote: quote
    }))
    , depth
    , $form = $el.find('form')
    , $submit = $form.find('button[type="submit"]')
    , $amount = $el.find('.amount')
    , ctrl = {
        $el: $el
    }

    function validateAmount(submitting) {
        $amount.removeClasses(/^(is|has)/)

        var amount = $amount.field().val()
        , validator = $.Deferred()
        .fail(function(code) {
            $amount.addClass('has-error ' + code)
        })

        // Allow empty unless submitting
        if (!amount.length && submitting !== true) return validator.resolve()

        // Validate format
        amount = numbers.parse(amount)

        if (!amount || amount <= 0) return validator.reject('is-invalid')

        try {
            amount = num(amount)
        } catch (e) {
            return validator.reject('is-invalid')
        }

        // Check for available funds
        if (amount.gt(api.balances[quote].available)) {
            return validator.reject('has-insufficient-funds')
        }

        if (amount.get_precision() > api.currencies[quote].scale) {
            return validator.reject('is-precision-too-high')
        }

        amount.set_precision(api.currencies[quote].scale)

        var receive = estimate.receive(market, amount)
        if (!receive) return validator.reject('is-too-deep')

        return validator.resolve(amount.toString())
    }

    function validate(submitting) {
        return validateAmount(submitting)
        .fail(function() {
            if (submitting === true) {
                $form.find('.has-error:first').field().focus()
                $submit.shake()
            }
        })
        .always(summarize)
    }

    function confirm(text) {
        var deferred = $.Deferred()

        alertify.confirm(text, function(ok) {
            deferred.resolve(ok)
        })

        return deferred
    }

    function amount() {
        return numbers.parse($amount.field().val())
    }

    $form.on('submit', function(e) {
        e.preventDefault()

        validate(true)
        .then(function() {
            var receive = estimate.receive(market, amount())

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

            api.call('v1/orders', {
                market: market,
                type: 'ask',
                amount: $amount.field().parseNumber(),
                price: null
            })
            .always(function() {
                $submit.loading(false)
                $form.removeClass('is-loading')
            })
            .fail(function(err) {
                errors.alertFromXhr(err)
            })
            .done(function() {
                api.depth(market)
                api.balances()

                alertify.log(i18n('trade.market.order placed'))
                //router.go('trade/orders')

                $amount.field().focus().val('')

            })
        })
    })

    function summarize() {
        var $summary = $el.find('.order-summary')
        , amount = numbers.parse($amount.field().val())
        , summary

        if (amount) {
            summary = estimate.summary(market, amount, feeRatio)
        }

        if (!summary) {
            $summary.find('.receive-price').empty()
            $summary.find('.fee').empty()
            $summary.find('.receive-quote').empty('')
            return
        }

        $summary.find('.receive-price')
        .html(numbers.format(summary.price, { precision: 3, currency: quote }))
        .attr('title', numbers.format(summary.price, { precision: 3, currency: quote }))

        if (feeRatio === 0) {
            $summary.find('.fee')
            .css('color', 'green')
            .css('font-weight', 'bold')
            .html('FREE')
        } else {
            $summary.find('.fee')
            .html(numbers.format(summary.fee, { precision: 3, currency: quote }))
            .attr('title', numbers.format(summary.fee, {
                precision: api.currencies[quote].scale,
                currency: quote
            }))
        }

        $summary.find('.receive-quote')
        .html(numbers(summary.receiveAfterFee, { precision: 3, currency: quote }))
        .attr('title', numbers(summary.receiveAfterFee, {
            precision: api.currencies[quote].scale,
            currency: quote
        }))
    }

    $el.on('click', '[data-action="sell-all"]', function(e) {
        e.preventDefault()
        $form.field('amount')
        .val(numbers.format(api.balances[base].available, {
            maxPrecision: api.currencies[base].scale - api.markets[market].scale
        }))
        .trigger('change')
    })

    function onBalance() {
        validate()
    }

    function onDepth(x) {
        depth = x
        debug('re-validating on depth update...')
        validate()
    }

    api.on('balances:' + quote, onBalance)
    api.on('depth:' + market, onDepth)

    $amount.field().on('keyup change', validate)

    $el.find('.available').replaceWith(balanceLabel({
        currency: quote,
        flash: true
    }).$el)

    $el.on('remove', function() {
        api.off('balances:' + quote, onBalance)
        api.off('depth:' + market, onDepth)
    })

    $amount.field().focusSoon()

    return ctrl
}
