var template = require('./index.html')

module.exports = function() {
    var $el = $('<footer id="footer">').html(template({
        landingLanguage: i18n.desired && i18n.desired.match(/no/i) ? 'no' : 'en'
    }))
    , controller = {
        $el: $el
    }

    return controller
}
