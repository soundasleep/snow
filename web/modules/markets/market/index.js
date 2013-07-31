var template = require('./template.html')

module.exports = function(market) {
    var $el = $('<div class="market">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
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

    // Change order mode
    $el.on('click', '[data-action="toggle-order-mode"]', function(e) {
        e.preventDefault()
        var mode = $(this).attr('data-order-mode')
        setOrderMode(mode)
    })

    setOrderMode('market')

    controller.destroy = function() {
        marketOrder.destroy()
        limitOrder.destroy()
        depth.destroy()
    }

    return controller
}
