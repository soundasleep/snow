var nav = require('../nav')
, template = require('./index.html')

module.exports = function() {
    var $el = $('<div class=deposit-bank>').html(template({
        messageToRecipient: api.user.id * 1234
    }))
    , controller = {
        $el: $el
    }

    $el.find('.deposit-nav').replaceWith(nav('bank').$el)

    return controller
}
