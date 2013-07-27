var template = require('./template.html')

module.exports = function() {
    var $el = $('<div class="terms">').html(template())
    , controller = {
        $el: $el
    }

    return controller
}
