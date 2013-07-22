var template = require('./template.html')

module.exports = function(tab) {
    var $el = $('<div class="admin-header">').html(template())
    , controller = {
        $el: $el
    }

    if (tab) {
        $el.find('.nav .' + tab).addClass('active')
    }

    return controller
}
