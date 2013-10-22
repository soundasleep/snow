var template = require('./template.html')

module.exports = function() {
    var $el = $('<div class="overview">').html(template())
    , controller = {
        $el: $el
    }

    function refreshBtcHeight() {
        api.call('admin/btc/height')
        .fail(errors.alertFromXhr)
        .done(function(res) {
            $el.find('.btc-height').html(res.height)
        })
    }

    function refreshLtcHeight() {
        api.call('admin/ltc/height')
        .fail(errors.alertFromXhr)
        .done(function(res) {
            $el.find('.ltc-height').html(res.height)
        })
    }

    refreshBtcHeight()
    refreshLtcHeight()

    return controller
}
