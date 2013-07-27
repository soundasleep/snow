var _ = require('lodash')
, template = require('./template.html')
, marketTemplate = require('./market.html')
, debug = require('../../util/debug')('snow:markets')

module.exports = function(id) {
    var $el = $('<div class="markets">').html(template())
    , controller = {
        $el: $el
    }
    , market
    , currentMarketId

    function setMarket(id) {
        market && market.destroy()
        market = require('./market')(id)
        $el.find('.market-container').html(market.$el)

        // Set active navigation item
        $el.find('.markets-nav .market[data-id="' + id + '"]')
        .addClass('active').siblings().removeClass('active')

        currentMarketId = id
    }

    function onMarkets(markets) {
        markets = _.sortBy(markets, function(market) {
            return (market.id == 'BTCNOK' ? 0 : 1) + market.id
        })

        $el.find('.markets-nav').html($.map(markets, function(market) {
            return $(marketTemplate(market))
        }))

        $el.find('.markets-nav .market[data-id="' + currentMarketId + '"]')
        .addClass('active').siblings().removeClass('active')
    }

    onMarkets(api.markets.value)

    setTimeout(function() {
        $el.find('input:visible:first').focus()
    }, 750)

    controller.destroy = function() {
        debug('destroying controller...')
        market.destroy()
    }

    setMarket(id)

    return controller
}
