// Skip landing page?
if ($.cookie('apiKey') || $.cookie('existingUser')) {
    window.location = '/client/#login'
}

require('./helpers/jquery')

var landing = require('./controllers/landing')()
$('body').append(landing.$el)
