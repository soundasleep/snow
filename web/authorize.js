exports.user = function(register) {
    if (api.user) return true

    var after = window.location.hash.substr(1)

    // Avoid looping after-inception
    after = after.replace(/(register|login)(\?after=)?/, '')

    router.go((register ? 'register' : 'login') + (after ? '?after=' + after : ''))
}

exports.admin = function() {
    if (api.user && api.user.admin) return true
    alert('Not admin')
}

exports.identity = function() {
    if (api.user && api.user.firstName) return true
    router.go('identity?after=' + window.location.hash.substr(1))
}
