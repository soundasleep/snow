
module.exports = function() {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $balances = $el.find('.balances')

    $el.filter('.header-placeholder').html(require('../header')('balances').$el)

    function itemsChanged(items) {
        $balances.html($.map(items, function(item) {
            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('admin/balances')
        .fail(errors.alertFromXhr)
        .done(itemsChanged)
    }

    refresh()

    $el.find('.nav a[href="#admin/balances"]').parent().addClass('active')

    return controller
}
