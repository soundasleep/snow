var template = require('./index.html')
, marketTemplate = require('./market.html')

module.exports = function(tab, mode, type) {
    var $el = $('<div class=trade-nav>').html(template())
    , controller = {
        $el: $el
    }

    if (tab) {
        $el.find('.nav .' + tab).addClass('active')
    }

    function marketsFetched(markets) {
        $el.find('.nav').append($.map(markets, function(market) {
            return marketTemplate({
                id: market.id,
                type: type == 'ask' ? 'sell' : 'buy',
                mode: mode == 'limit'? 'advanced' : 'instant'
            })
        }))

        if (tab) {
            $el.find('.nav .' + tab).addClass('active')
        }
    }

    if (api.markets.value) {
        marketsFetched(api.markets.value)
    } else {
        api.markets().done(marketsFetched)
    }

    return controller
}
