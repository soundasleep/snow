var debug = require('debug')('snow:ripple')
, Remote = require('ripple-lib').Remote

module.exports = exports = function(app) {
    exports.app = app

    exports.remote = new Remote({
        trusted: false,
        local_signing: true,
        local_fee: true,
        fee_cusion: 1.5,
        trace: true,
        servers: [
            {
                host: 's1.ripple.com',
                port: 443,
                secure: true
            }
        ]
    })

    return exports
}

exports.connect = function() {
    debug('connecting to ripple...')

    exports.remote.connect(function() {
        debug('connected to ripple')
    })
}
