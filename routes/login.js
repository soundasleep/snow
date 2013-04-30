var Backbone = require('backbone')
, app = require('../app')
, LoginView = require('../views/LoginView')
, LoginRoute = module.exports = Backbone.Router.extend({
    routes: {
    },

    initialize: function() {
        this.route(/^login(?:\?after=(.+))?/, 'login')
    },

    login: function(after) {
        var that = this
        after || (after = 'my/balances')

        var view = new LoginView()
        app.section(view)
    }
})
