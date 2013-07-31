var num = require('num')
, _ = require('lodash')
, template = require('./template.html')
, debug = require('../../../../../util/debug')('trade')

module.exports = function(market) {
    var $el = $('<div class="ask">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
    }))
    , controller = {
        $el: $el
    }
    , quote = market.substr(3, 3)
    , base = market.substr(0, 3)
    , depth
    , $sell = $el.find('.sell')
    , pricePrecision = _.find(api.markets.value, { id: market }).scale
    , basePrecision = _.find(api.currencies.value, { id: base }).scale
    , volumePrecision = basePrecision - pricePrecision
    , quotePrecision = _.find(api.currencies.value, { id: quote }).scale

    function updateQuote() {
        $el.removeClass('is-too-deep')

        if (!depth) return
        var sell = numbers.parse($el.field('sell').val())

        if (sell === null) return
        sell = num(sell)

        if (sell.lte(0)) return

        if (!depth.bids.length) {
            $sell.addClass('error')
            $el.addClass('is-too-deep')
            return
        }

        var receive = num(0)
        , remaining = num(sell)

        var filled = _.some(depth.bids, function(level) {
            debug('%s remaining', remaining.toString())

            var price = num(level[0])
            , volume = num(level[1])
            , take = volume.gte(remaining) ? remaining : volume

            if (take.eq(0)) {
                return true
            }

            var total = take.mul(price)

            debug('Taking %s @ %s (of %s); Total %s',
                take.toString(), price.toString(), volume.toString(),
                total.toString())

            receive = receive.add(take.mul(price))
            remaining = remaining.sub(take)

            debug('Sum receive %s, remaining %s', receive.toString(),
                remaining.toString())

            if (remaining.eq(0)) {
                return true
            }
        })

        $el.toggleClass('is-too-deep', !filled)

        if (!filled) {
            $sell.addClass('error')
            return
        }

        // Subtract fee
        receive = receive.mul('0.995')

        var effectivePrice = receive.div(sell)
        effectivePrice.set_precision(pricePrecision)

        receive.set_precision(quotePrecision)

        $el.find('.receive-quote').html(
            numbers.format(receive.toString()))

        $el.find('.receive-price').html(
            numbers.format(effectivePrice.toString()))
    }

    function balancesUpdated() {
        var balances = api.balances.current
        , item = _.find(balances, { currency: base })

        $el.find('.available')
        .html(numbers.format(item.available,
            { maxPrecision: 2, currency: item.currency }))
        .attr('title', numbers.format(item.available, { currency: item.currency }))


        // The user's ability to cover the order may have changed
        validateSell()
    }

    function validateSell(emptyIsError) {
        $el
        .removeClass('has-insufficient-funds')
        .removeClass('is-precision-too-high')

        var val = $el.field('sell').val()
        , valid

        if (!val.length) {
            valid = !emptyIsError
            $sell.toggleClass('error', !valid)
            return valid
        }

        var sell = numbers.parse(val)

        if (sell === null) {
            valid = false
        } else {
            if (num(sell).lte(0)) return

            var precision = num(sell).get_precision()
            , maxPrecision = volumePrecision

            if (precision > maxPrecision) {
                valid = false
                $el.addClass('is-precision-too-high')
            } else {
                var item = _.find(api.balances.current, { currency: base })

                if (!item) {
                    debug('User does not have a %s balance', base)
                    return
                }

                var available = item.available

                if (num(sell).gt(available)) {
                    debug('Available %s < required %s', available.toString(),
                        sell.toString())

                    valid = false
                    $el.addClass('has-insufficient-funds')
                } else {
                    valid = true
                }
            }
        }

        $sell.toggleClass('error', !valid)

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

    // Update market order sell (bid)
    $el.field('sell').on('change keyup', function() {
        // Order matters. Validate clears error, bid quote may add error.
        validateSell()
        updateQuote()
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $button = $el.find('[type="submit"]')
        , $form = $el.find('form')

        if (!validateSell(true)) {
            $form.field('sell').focus()
            $button.shake()
            return
        }

        $button.loading(true, i18n('markets.market.marketorder.ask.placing order'))
        $form.addClass('is-loading')

        api.call('v1/orders', {
            market: market,
            type: 'ask',
            amount: $el.field('sell').parseNumber(),
            price: null
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

    $el.on('click', '[data-action="sell-all"]', function(e) {
        e.preventDefault()
        var item = _.find(api.balances.current, { currency: base })

        if (!item) {
            alert(base + ' balance unknown')
            return
        }

        $el.field('sell').val(numbers.format(item.available))
        $el.field('sell').trigger('change')
    })

    // Subscribe to balance updates
    api.balances.current && balancesUpdated()
    api.on('balances', balancesUpdated)
    api.on('depth:' + market, onDepth)

    return controller
}
