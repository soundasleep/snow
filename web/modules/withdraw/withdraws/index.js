var moment = require('moment')

module.exports = function() {
    var itemTemplate = require('./item.html')
    , controller = {
        $el: $(require('./template.html')())
    }
    , $items = controller.$el.find('.items')

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            item.ago = moment(item.created).fromNow()
            item.good = null
            item.bad = null

            if (item.method == 'ripple') {
                item.destination = 'Ripple: ' + item.destination
            }

            if (item.state == 'completed') {
                item.status = i18n('withdraws.states.completed',
                    moment(item.completed).fromNow())
                item.good = true
            } else if (item.state == 'processing') {
                item.status = i18n('withdraws.states.processing')
            } else if (item.state == 'requested') {
                item.status = i18n('withdraws.states.requested')
            } else if (item.state == 'cancelled') {
                if (item.error) {
                    item.status = i18n('withdraws.states.cancelled.error', item.error)
                    item.bad = true
                } else if (item.error === null) {
                    item.status = i18n('withdraws.states.cancelled')
                }
            } else {
                item.status = 'Unknown, ' + item.state
            }

            var $el = $(itemTemplate(item))
            $el.attr('data-id', item.id)
            return $el
        }))

        controller.$el.toggleClass('is-empty', !items.length)
    }

    function refresh() {
        api.call('v1/withdraws')
        .fail(errors.alertFromXhr)
        .done(itemsChanged)
    }

    $items.on('click', '.cancel', function(e) {
        e.preventDefault()
        var $item = $(e.target).closest('.item')

        api.call('v1/withdraws/' + $item.attr('data-id'), null, { type: 'DELETE' })
        .fail(errors.alertFromXhr)
        .done(function() {
            api.balances()
            refresh()
        })
    })

    refresh()

    return controller
}
