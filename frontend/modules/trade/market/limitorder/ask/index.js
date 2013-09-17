var num = require('num')
, _ = require('lodash')
, template = require('./index.html')
, debug = require('../../../../../helpers/debug')('trade')

module.exports = function(market) {
    var $el = $('<div class="ask">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
    }))
    , controller = {
        $el: $el
    }
    , base = market.substr(0, 3)
    , quote = market.substr(3)
    , depth
    , $amount = $el.find('.amount')
    , $price = $el.find('.price')
    , maxPricePrecision = _.find(api.markets.value, { id: market }).scale
    , baseScale = _.find(api.currencies.value, { id: base }).scale
    , maxAmountPrecision = baseScale - maxPricePrecision

    function updateQuote() {
        var price = numbers.parse($el.field('price').val())
        , amount = numbers.parse($el.field('amount').val())

        if (price === null || price <= 0) return
        if (amount === null || amount <= 0) return

        price = num(price)
        amount = num(amount)

        var total = price.mul(amount)

        // In case the user has entered too many decmials.
        total.set_precision(maxPricePrecision + maxAmountPrecision)

        $el.find('.quote').html(numbers.format(total.toString()))
    }

    function balancesUpdated() {
        var balances = api.balances.current
        , item = _.find(balances, { currency: base })

        $el.find('.available')
        .html(numbers.format(item.available,
            { maxPrecision: 2, currency: item.currency }))
        .attr('title', numbers.format(item.available, { currency: item.currency }))

        // The user's ability to cover the order may have changed
        validateAmount()
    }

    function validatePrice(emptyIsError) {
        $price
        .removeClass('is-precision-too-high')

        var val = $el.field('price').val()
        , valid

        if (val.length) {
            var price = numbers.parse(val)

            if (price === null) {
                valid = false
            } else {
                if (num(price).lte(0)) return

                var precision = num(price).get_precision()

                if (precision > maxPricePrecision) {
                    valid = false
                    $price.addClass('is-precision-too-high')
                } else {
                    valid = true
                }
            }
        } else {
            valid = emptyIsError
        }

        $price.toggleClass('has-error', !valid)

        return valid
    }

    function validateAmount(emptyIsError) {
        $amount
        .removeClass('has-insufficient-funds')
        .removeClass('is-precision-too-high')

        var val = $el.field('amount').val()
        , valid

        if (!val.length) {
            valid = !emptyIsError
            $amount.toggleClass('has-error', !valid)
            return valid
        }

        var amount = numbers.parse(val)

        if (amount === null) {
            valid = false
        } else {
            if (num(amount).lte(0)) return

            var precision = num(amount).get_precision()

            if (precision > maxAmountPrecision) {
                valid = false
                $amount.addClass('is-precision-too-high')
            } else if ($price.hasClass('error')) {
                valid = true
            } else {
                var item = _.find(api.balances.current, { currency: base })

                if (!item) {
                    debug('User does not have a %s balance', base)
                    return
                }

                var available = num(item.available)
                , required = amount

                if (available.lt(required)) {
                    valid = false
                    $amount.addClass('has-insufficient-funds')
                } else {
                    valid = true
                }
            }
        }

        $amount.toggleClass('has-error', !valid)

        return valid
    }

    function onDepth(d) {
        depth = d

        // If the user has not entered any
        if (!$el.field('price').val().length) {
            if (!depth.bids.length) {
                debug('no ask depth from which to suggest price')
                return
            }

            $el.field('price').val(numbers.format(depth.bids[0][0]))
        }
    }

    controller.destroy = function() {
        api.off('balances', balancesUpdated)
        api.off('depth:' + market, onDepth)
    }

    $el.field('price').on('change keyup', function(e) {
        if (e.which === 13) return

        // Order matters. Validate clears error, bid quote may add error.
        validatePrice()
        validateAmount()
        updateQuote()
    })

    $el.field('amount').on('change keyup', function(e) {
        if (e.which === 13) return

        // Order matters. Validate clears error, bid quote may add error.
        validatePrice()
        validateAmount()
        updateQuote()
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $button = $el.find('[type="submit"]')
        , $form = $el.find('form')

        if (!validateAmount(true)) {
            $form.field('amount').focus()
            $button.shake()
            return
        }

        if (!validatePrice(true)) {
            $form.field('price').focus()
            $button.shake()
            return
        }

        var confirmText = i18n('markets.market.limitorder.ask.confirm',
            numbers.format($el.field('amount').parseNumber(), { currency: base }),
            numbers.format($el.field('price').parseNumber(), { currency: quote }))

        alertify.confirm(confirmText, function(ok) {
            if (!ok) return

            $button.loading(true, i18n('markets.market.limitorder.ask.submitting'))
            $form.addClass('is-loading')

            api.call('v1/orders', {
                market: market,
                type: 'ask',
                amount: $el.field('amount').parseNumber(),
                price: $el.field('price').parseNumber()
            })
            .always(function() {
                $button.loading(false)
                $form.removeClass('is-loading')
            })
            .fail(function(err) {
                errors.alertFromXhr(err)
            })
            .done(function() {
                $el.field('amount', '')
                .field('price', '')
                $el.find('.available').flash()
                $form.field('amount').focus()

                api.depth(market)
                api.balances()
            })
        })
    })

    $el.on('click', '[data-action="sell-all"]', function(e) {
        e.preventDefault()
        var item = _.find(api.balances.current, { currency: base })

        if (!item) {
            alert(base + ' balance unknown')
            return
        }

        $el.field('amount').val(numbers.format(item.available))
        $el.field('amount').trigger('change')
    })

    // Subscribe to balance updates
    api.balances.current && balancesUpdated()
    api.on('balances', balancesUpdated)
    api.on('depth:' + market, onDepth)

    return controller
}
