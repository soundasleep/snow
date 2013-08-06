var debug = require('./util/debug')('authorize')

exports.user = function(level, register) {
    if (level === true) {
        level = 0
        register = true
    }

    return exports.demand(level || 0)
}

exports.demand = function(level, register) {
    var here = location.hash.substr(1)

    debug('requiring security level %d', level)

    if (!api.user) {
        debug('user is not logged in, redirecting to login')

        if (register) {
            if (here) {
                router.go('auth/login?after=' + here, true)
            } else {
                router.go('auth/login', true)
            }
        } else {
            if (here) {
                router.go('auth/register?after=' + here, true)
            } else {
                router.go('auth/register', true)
            }
        }

        return false
    }

    debug('user has security level %d', api.user.securityLevel)

    if (api.user.securityLevel >= level) {
        debug('user security level is sufficient')
        return true
    }

    if (api.user.securityLevel < 1) {
        debug('suggesting to verify email to reach level 1')
        router.go('auth/verifyemail?after=' + here, true)
    } else if (api.user.securityLevel < 2) {
        debug('suggesting to verify phone to reach level 2')
        router.go('auth/verifyphone?after=' + here, true)
    } else if (api.user.securityLevel < 3) {
        debug('suggesting to enter full name and address to reach level 3')
        router.go('auth/identity?after=' + here, true)
    } else if (api.user.securityLevel < 4) {
        debug('user country is %s', api.user.country)

        if (api.user.country == 'NO') {
            debug('suggesting to make verify via norwegian deposit')
            router.go('auth/norwaydeposit', true)
        } else {
            debug('suggesting to go through CIP')
            router.go('auth/cip?after=' + here, true)
        }
    }
}
