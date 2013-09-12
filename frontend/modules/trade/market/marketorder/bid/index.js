var num = require('num')
, _ = require('lodash')
, template = require('./index.html')
, debug = require('../../../../../helpers/debug')('trade')

module.exports = function(market) {
    var $el = $('<div class="bid">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
    }))
    , controller = {
        $el: $el
    }
    , base = market.substr(0, 3)
    , quote = market.substr(3, 3)
    , depth
    , $spend = $el.find('.spend')
    , quotePrecision = _.find(api.currencies.value, { id: quote }).scale
    , receive

    function updateQuote() {
        $el.removeClass('is-too-deep')

        if (!depth) return
        var spend = $el.field('spend').parseNumber()
        if (spend === null) return

        spend = num(spend)
        spend.set_precision(quotePrecision)

        if (spend.lte(0)) return

        if (!depth.asks.length) {
            $spend.addClass('has-error')
            $el.addClass('is-too-deep')
            return
        }

        receive = num(0)
        var remaining = num(spend)

        var filled = _.some(depth.asks, function(level) {
            var price = num(level[0])
            , volume = num(level[1])
            , theirTotal = price.mul(volume)
            , filled = theirTotal.gte(remaining)
            , take = filled ? remaining.div(price) : volume

            take.set_precision(volume.get_precision())

            if (take.eq(0)) {
                return true
            }

            var ourTotal = take.mul(price)

            debug('Taking %s @ %s (of %s); Total %s',
                take.toString(), price.toString(), volume.toString(),
                ourTotal.toString())

            receive = receive.add(take)
            remaining = remaining.sub(ourTotal)

            if (filled) {
                return true
            }
        })

        $el.toggleClass('is-too-deep', !filled)

        if (!filled) {
            debug('Would not be filled')
            $spend.addClass('has-error')
            return
        }

        if (+receive === 0) {
            debug('Would receive zero')
            $spend.addClass('has-error is-too-small')
            return
        }

        // Subtract fee
        var actualSpend = spend.sub(remaining)
        , effectivePrice = actualSpend.div(receive)

        debug('Effective price: %s / %s = %s', actualSpend.toString(),
            receive.toString(), effectivePrice.toString())

        $el.find('.actual-spend').html(
            numbers.format(actualSpend.toString()))

        $el.find('.receive-quote').html(
            numbers.format(receive.toString()))

        $el.find('.receive-price').html(
            numbers.format(effectivePrice.toString()))
    }

    function balancesUpdated() {
        var balances = api.balances.current
        , item = _.find(balances, { currency: quote })

        $el.find('.available')
        .html(numbers.format(item.available,
            { maxPrecision: 2, currency: item.currency }))
        .attr('title', numbers.format(item.available, { currency: item.currency }))

        // The user's ability to cover the order may have changed
        validateSpend()
    }

    function validateSpend(emptyIsError) {
        $spend
        .removeClass('has-insufficient-funds')
        .removeClass('is-precision-too-high')
        .removeClass('is-too-small')

        var val = $el.field('spend').val()
        , valid

        if (!val.length) {
            valid = !emptyIsError
            $spend.toggleClass('has-error', !valid)
            return valid
        }

        var spend = numbers.parse(val)

        if (spend === null) {
            valid = false
        } else {
            var precision = num(spend).get_precision()
            , maxPrecision = quotePrecision

            if (precision > maxPrecision) {
                valid = false
                $spend.addClass('is-precision-too-high')
            } else {
                var item = _.find(api.balances.current, { currency: quote })

                if (!item) {
                    debug('User does not have a %s balance', quote)
                    return
                }

                var available = item.available

                if (num(spend).gt(available)) {
                    valid = false
                    $spend.addClass('has-insufficient-funds')
                } else {
                    valid = true
                }
            }
        }

        $spend.toggleClass('has-error', !valid)

        return valid
    }

    function onDepth(res) {
        depth = res
        updateQuote()
    }

    controller.destroy = function() {
        api.off('balances', balancesUpdated)
        api.off('depth:' + market, onDepth)
    }

    // Update market order spend (bid)
    $el.field('spend').on('change keyup', function() {
        // Order matters. Validate clears error, bid quote may add error.
        validateSpend()
        updateQuote()
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $button = $el.find('[type="submit"]')
        , $form = $el.find('form')

        if (!validateSpend(true)) {
            $form.field('spend').focus()
            $button.shake()
            return
        }

        var confirmText = i18n(
            'markets.market.marketorder.bid.confirm',
            base,
            numbers($el.field('spend').parseNumber(), { currency: quote }),
            numbers(receive, { currency: base }))

        alertify.confirm(confirmText, function(ok) {
            if (!ok) return

            $button.loading(true, i18n('markets.market.marketorder.bid.placing order'))
            $form.addClass('is-loading')

            api.call('v1/spend', {
                market: market,
                amount: $el.field('spend').parseNumber()
            })
            .always(function() {
                $button.loading(false)
                $form.removeClass('is-loading')
            })
            .fail(function(err) {
                errors.alertFromXhr(err)
            })
            .done(function() {
                $el.field('spend', '')
                $el.find('.available').flash()
                $form.field('spend').focus()

                api.depth(market)
                api.balances()
            })
        })
    })

    $el.on('click', '[data-action="spend-all"]', function(e) {
        e.preventDefault()
        $el.field('spend').val(numbers.format(
            _.find(api.balances.current, { currency: quote }).available))
        $el.field('spend').trigger('change')
    })

    // Subscribe to balance updates
    api.balances.current && balancesUpdated()
    api.on('balances', balancesUpdated)
    api.on('depth:' + market, onDepth)

    return controller
}
