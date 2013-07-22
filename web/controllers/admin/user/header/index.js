var template = require('./template.html')
, header = require('../../header')

module.exports = function(userId, tab) {
    var $el = $('<div class="admin-user-header">').html(template({
        userId: userId
    }))
    , controller = {
        $el: $el
    }

    $el.find('.header-placeholder').replaceWith(header('users').$el)

    if (tab) {
        $el.find('.nav .' + tab).addClass('active')
    }

    return controller
}
