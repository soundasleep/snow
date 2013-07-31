var moment = require('moment')
, _ = require('lodash')

module.exports = function() {
    var itemTemplate = require('./item.html')
    , controller = {
        $el: $(require('./template.html')())
    }
    , $items = controller.$el.find('.activities')

    function itemsChanged(items) {
        // Sort so that fills appear after creates
        items = _.sortBy(items, function(item) {
            var epoch = moment(item.created).unix()

            if (item.type == 'FillOrder') {
                epoch += 5
            }

            return -epoch
        })

        $items.html($.map(items, function(item) {
            var duration = new Date() > moment(item.created) ?
                moment(item.created).fromNow() : moment().fromNow()

            item.text = require('../../../util/activity')(item)
            item.ago = duration

            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('v1/activities')
        .fail(errors.alertFromXhr)
        .done(itemsChanged)
    }

    refresh()

    return controller
}
