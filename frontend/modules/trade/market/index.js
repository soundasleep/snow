var template = require('./index.html')
, nav = require('../nav')

module.exports = function(market, mode, type) {
    var $el = $('<div class="trade-market">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3),
        id: market,
        mode: mode == 'limit' ? 'advanced' : 'instant',
        type: type == 'ask' ? 'sell' : 'buy'
    }))
    , controller = {
        $el: $el
    }
    , marketOrder = require('./marketorder')(market)
    , limitOrder = require('./limitorder')(market)
    , depth = require('./depth')(market)

    $el.find('.market-order').replaceWith(marketOrder.$el)
    $el.find('.limit-order').replaceWith(limitOrder.$el)
    $el.find('.depth-container').html(depth.$el)

    // Set order mode (market or limit)
    function setOrderMode(mode) {
        $el.removeClasses(/^is-order-mode/).addClass('is-order-mode-' + mode)
        $el.find('[data-order-mode="' + mode + '"]')
        .parent().addClass('active').siblings().removeClass('active')

        $el.find('input:visible:first').focus()
    }

    setOrderMode(mode)

    var subModule = mode == 'limit' ? limitOrder : marketOrder
    subModule.setOrderType(type)

    controller.destroy = function() {
        marketOrder.destroy()
        limitOrder.destroy()
        depth.destroy()
    }

    $el.find('.trade-nav').replaceWith(nav(market, mode, type).$el)

    return controller
}
