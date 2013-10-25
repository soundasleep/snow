var nav = require('../../nav')
, template = require('./index.html')

module.exports = function() {
    var $el = $('<div class=deposit-bank-NOK>').html(template({
        messageToRecipient: api.user.tag
    }))
    , ctrl = {
        $el: $el
    }

    // Insert navigation
    $el.find('.deposit-nav').replaceWith(nav('bank').$el)

    return ctrl
}
