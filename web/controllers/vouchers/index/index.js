var template = require('./template.html')
, itemTemplate = require('./item.html')

module.exports = function() {
    var $el = $('<div class="vouchers">').html(template())
    , controller = {
        $el: $el
    }
    , $items = $el.find('.vouchers')

    function refresh() {
        api.call('v1/vouchers')
        .fail(errors.alertFromXhr)
        .done(itemsUpdated)
    }

    function itemsUpdated(items) {
        $el.toggleClass('is-empty', !items.length)
        $items.html($.map(items, function(item) {
            return $(itemTemplate(item))
        }))
    }

    $items.on('click', '.cancel', function(e) {
        e.preventDefault()

        var $item = $(this).closest('.voucher')
        , $button = $(this).loading(true)
        , url = 'v1/vouchers/' + $item.attr('data-id') + '/redeem'

        api.call(url, null, { type: 'POST' })
        .always(function() {
            $button.loading(false)
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            $item.fadeAway()
            api.balances()
        })
    })

    refresh()

    return controller
}
