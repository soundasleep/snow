var template = require('./template.html')
, assert = require('assert')

module.exports = function(dt) {
    var $el = $('<div class="withdraw">').html(template())
    , controller = {
        $el: $el
    }
    , dest

    // Cannot require dynamically because of browserify
    if (dt == 'bitcoin') dest = require('./bitcoin')()
    else if (dt == 'litecoin') dest = require('./litecoin')()
    else if (dt == 'ripple') dest = require('./ripple')()
    else if (dt == 'bank') dest = require('./bank')()
    else if (dt == 'email') dest = require('./email')()
    assert(dest)

    $el.find('.dest-container').html(dest.$el)

    $el.find('a[href="#withdraw/' + dt + '"]')
    .parent().addClass('active')

    controller.destroy = function() {
        dest.destroy && dest.destroy()
    }

    setTimeout(function() {
        $el.find('input:visible:first').focus()
    }, 500)

    return controller
}
