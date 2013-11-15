module.exports = function(app) {
    var analytics = require('analytics-node')
    analytics.init({ secret: app.config.segment_secret })
    return analytics
}
