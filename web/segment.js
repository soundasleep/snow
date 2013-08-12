var debug = require('./util/debug')('segment')

function attach(user) {
    api.off('user', attach)

    debug('Fetching Intercom settings')
    api.call('v1/intercom')
    .fail(errors.reportFromXhr)
    .done(function(settings) {
        debug('Intercom settings', settings)
        debug('Identifying with segment.io')

        analytics.identify(user.id.toString(), {
            email: user.email
        }, {
            intercom: settings
        })
    })
}

api.on('user', attach)
