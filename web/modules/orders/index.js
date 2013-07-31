var itemTemplate = require('./item.html')
, historyItemTemplate = require('./history-item.html')

module.exports = function() {
    var $el = $('<div class="orders">').html(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $items = $el.find('.active-orders .items')
    , $historyItems = $el.find('.order-history .items')

    function itemsChanged(items) {
        $items.append($.map(items, function(item) {
            var $el = $(itemTemplate(item))
            return $el
        }))
    }

    function historyItemsChanged(items) {
        $historyItems.append($.map(items, function(item) {
            item.base = item.market.substr(0, 3)
            item.quote = item.market.substr(3, 3)
            var $el = $(historyItemTemplate(item))
            $el.attr('data-id', item.id)
            return $el
        }))
    }

    function refresh() {
        api.call('v1/orders')
        .fail(errors.alertFromXhr)
        .done(itemsChanged)
    }

    function refreshHistory() {
        api.call('v1/orders/history')
        .fail(errors.alertFromXhr)
        .done(historyItemsChanged)
    }

    $items.on('click', 'button.cancel', function(e) {
        e.preventDefault()

        var $item = $(e.target).closest('.item')
        $(this).loading(true, 'Deleting...')

        api.call('v1/orders/' + $item.attr('data-id'), null, { type: 'DELETE' })
        .fail(errors.alertFromXhr)
        .done(function() {
            api.balances()
            $item.remove()
        })
    })

    refresh()
    refreshHistory()

    return controller
}
