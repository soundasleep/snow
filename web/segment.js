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
            email: user.email,
            created: settings.created_at
        }, {
            intercom: settings
        })
    })
}

function verifiedphone(e) {
    if (typeof Intercom == 'undefined' || !Intercom) {
        debug('Will not update Intercom with phone because it\'s disabled')
        return
    }

    debug('updating Intercom with phone number and time of verification')

    Intercom('update', {
        phone: e.number,
        phone_verified_at: Math.round(+new Date() / 1e3)
    })

    debug('intercom update started')
}

if (window.location.hostname != 'localhost') {
    api.on('user', attach)
    $app.on('verifiedphone', verifiedphone)
}
