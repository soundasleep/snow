var template = require('./index.html')
, validation = require('../../../../helpers/validation')

module.exports = function() {
    var $el = $('<div class=account-bankaccounts-addnorway>')
    .html(template())
    , ctrl = {
        $el: $el
    }
    , $modal = $el.find('.modal')
    , $form = $el.find('form')
    , $submit = $form.find('[type="submit"]')

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

    var validateAccount = validation.fromRegex(
        $el.find('.account-number'), /^[0-9]{11}$/)
    validation.monitorField($el.field('accountNumber'), validateAccount)

    var validate = validation.fromFields({
        accountNumber: validateAccount
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        validate(true)
        .fail(function() {
            $form.find('.has-error:first').field().focus()
            $submit.shake()
        })
        .done(function(values) {
            if (!values.accountNumber) return

            $submit.loading(true)

            api.call('v1/bankAccounts', {
                accountNumber: values.accountNumber
            })
            .always(function() {
                $submit.loading(false)
            })
            .fail(errors.alertFromXhr)
            .done(function() {
                history.go(-1)
            })
        })
    })

    $el.field().focusSoon()

    return ctrl
}
