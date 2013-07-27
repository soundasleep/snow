module.exports = function() {
    var $el = $(require('./template.html')({
        messageToRecipient: api.user.id * 1234
    }))
    , controller = {
        $el: $el
    }

    return controller
}
