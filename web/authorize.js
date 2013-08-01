exports.user = function(register) {
    if (api.user) return true

    var after = window.location.hash.substr(1)

    // Avoid looping after-inception
    after = after.replace(/(register|login|auth\/)(\?after=)?/g, '')

    router.go((register ? 'auth/register' : 'auth/login') + (after ? '?after=' + after : ''))
}

exports.identity = function() {
    if (api.user && api.user.firstName) return true
    router.go('auth/identity?after=' + window.location.hash.substr(1))
}
