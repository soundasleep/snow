var template = require('./index.html')
, marketTemplate = require('./market.html')
, _ = require('lodash')

module.exports = function(tab, mode, type) {
    var $el = $('<div class=trade-nav>').html(template({
        market: tab,
        mode: mode == 'limit' ? 'advanced' : 'instant',
        type: type == 'ask' ? 'sell' : type == 'bid' ? 'buy' : 'stats'
    }))
    , controller = {
        $el: $el
    }

    $el.find('.order-modes .instant').toggleClass('active', mode == 'market')
    $el.find('.order-modes .advanced').toggleClass('active', mode == 'limit')

    function marketsFetched(markets) {
        markets = _.sortBy(markets, function(x) {
            return (x.id == api.defaultMarket() ? 0 : 1) + x.id
        })

        $el.find('.nav').append($.map(markets, function(market) {
            return marketTemplate({
                id: market.id,
                type: type == 'ask' ? 'sell' : type == 'bid' ? 'buy' : 'stats',
                mode: mode == 'limit'? 'advanced' : 'instant'
            })
        }))

        if (tab) {
            $el.find('.nav .' + tab).addClass('active')

            if (type) {
                $el.find('.nav .' + tab + ' .' + type)
                .addClass('active')
            }
        }
    }

    if (api.markets.value) {
        marketsFetched(api.markets.value)
    } else {
        api.markets().done(marketsFetched)
    }

    return controller
}
