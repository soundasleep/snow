var num = require('num')
, _ = require('lodash')
, template = require('./index.html')
, debug = require('../../../../../helpers/debug')('trade')

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
    , basePrecision = _.find(api.currencies.value, { id: base }).scale
    , quotePrecision = _.find(api.currencies.value, { id: quote }).scale

    function available() {
        return api.balances.current ?
            _.find(api.balances.current, { currency: quote }).available :
            null
    }

    function receiveFromAmount(desired) {
        if (!depth) return

        var asks = depth.asks
        , give = num(0)
        , receive = num(0)
        , remaining = num(desired)

        give.set_precision(quotePrecision)
        receive.set_precision(basePrecision)
        remaining.set_precision(quotePrecision)

        var filled

        _.some(asks, function(level) {
            debug('start loop, remaining %s', remaining)

            level = {
                price: num(level[0]),
                volume: num(level[1]),
                total: num(level[0]).mul(level[1])
            }

            debug('going through level %s @ %s (%s)',
                level.price, level.volume, level.total)

            filled = level.total.gte(remaining)

            debug('filled? %s', filled)

            debug('%s / %s = %s', remaining, level.price, remaining.div(level.price))

            var take = filled ? remaining.div(level.price) : level.volume
            take.set_precision(level.volume.get_precision())

            if (take.eq(0)) {
                debug('would take zero from the level. this implies filled before')
                filled = true
                return true
            }

            receive = receive.add(take)

            debug('will take %s from the level', take)

            var total = level.price.mul(take)

            debug('our total %s', total)

            remaining = remaining.sub(total)

            debug('remaining after take %s', remaining)

            if (filled) {
                debug('level has filled remainder of order')
                return true
            }
        })

        if (filled) return receive.toString()
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

        var receive = receiveFromAmount(amount)

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

        debug('validating before submit')

        validate(true)
        .done(function() {
            $amount.field().focus()

            api.depth(market)
            api.balances()

            var receive = receiveFromAmount($amount.field().val())

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
                $el.find('.available').flash()

                api.depth(market)
                api.balances()
            })
        })
    })

    function summarize() {
        var $summary = $el.find('.order-summary')
        , amount = $amount.field().val()
        , receiveAmount = receiveFromAmount(amount)

        var price = num(amount)
        .set_precision(quotePrecision)
        .div(receiveAmount)
        .set_precision(3)

        var fee = num(receiveAmount)
        .mul(feeRatio)
        .set_precision(quotePrecision)

        var receiveAfterFee = num(receiveAmount)
        .mul(num('1.000').sub(fee))

        $summary.find('.receive-price').html(price.toString())
        $summary.find('.fee').html(fee.toString())
        $summary.find('.receive-quote').html(receiveAfterFee.toString())
    }

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

    return controller
}
