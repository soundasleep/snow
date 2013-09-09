require('../../../vendor/shake')

module.exports = function() {
    var $el = $(require('./index.html')())
    , controller = {
        $el: $el
    }
    , $newPassword = $el.find('.new-password')
    , $newPasswordRepeat = $el.find('.new-password-repeat')
    , $button = $el.find('button')

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var newPassword = $newPassword.find('input').val()
        , newPasswordRepeat = $newPasswordRepeat.find('input').val()

        if (newPassword.length < 6) {
            return alert('Minimum 6 characters, please')
        }

        if (newPassword != newPasswordRepeat) {
            return alert('Password and repeat are not the same')
        }

        $newPassword.add($newPasswordRepeat).add($button)
        .enabled(false)

        if (!api.user.email) throw new Error('email is missing from user')

        api.changePassword(newPassword)
        .always(function() {
            $newPassword.add($newPasswordRepeat).add($button)
            .enabled(true)
        }).done(function() {
            alert('Password has been changed. Please sign in again.')
            $.removeCookie('apiKey')
            window.location = '/'
        }).fail(errors.alertFromXhr)
    })

    $newPassword.find('input').focusSoon()

    return controller
}
