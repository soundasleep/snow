var nav = require('../nav')
, template = require('./index.html')
, sepa = require('../../../assets/sepa.json')

module.exports = function() {
    var $el = $('<div class=deposit-bank>').html(template({
        messageToRecipient: api.user.id * 1234
    }))
    , controller = {
        $el: $el
    }

    $el.find('.deposit-nav').replaceWith(nav('bank').$el)

    $el.toggleClass('is-norway', api.user.country == 'NO')
    $el.toggleClass('is-sepa', !!~sepa.indexOf(api.user.country))

    return controller
}
