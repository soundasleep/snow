var template = require('./index.html')

module.exports = function() {
    var $el = $('<div class=account-bankaccounts-addnorway>')
    .html(template())
    , ctrl = {
        $el: $el
    }
    , $modal = $el.find('.modal')

    ctrl.destroy = function() {
        $modal.modal('hide')
    }

    $el.on('click', '[data-action="close"]', function(e) {
        e.preventDefault()
        history.go(-1)
    })

    $el.find('.modal').modal({
        keyboard: false,
        backdrop: 'static'
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        if (!$el.find('form').validate(true)) {
            return
        }

        var $btn = $el.find('[type="submit"]')
        .loading(true)

        api.call('v1/bankAccounts', {
            accountNumber: $el.field('accountNumber').val()
        })
        .always(function() {
            $btn.loading(false)
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            history.go(-1)
        })
    })

    $el.field().focusSoon()

    return ctrl
}
