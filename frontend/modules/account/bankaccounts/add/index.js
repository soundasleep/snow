var template = require('./index.html')
, validation = require('../../../../helpers/validation')

module.exports = function() {
    var $el = $('<div class=account-bankaccounts-add>')
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

    var validateIban = validation.fromRegex($el.find('.iban'), /^[A-Za-z0-9 ]{1,35}$/)
    validation.monitorField($el.field('iban'), validateIban)

    var validateSwift = validation.fromRegex($el.find('.swift'), /^[A-Za-z0-9 ]{1,15}$/)
    validation.monitorField($el.field('swift'), validateSwift)

    var validate = validation.fromFields({
        iban: validateIban,
        swift: validateSwift
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        validate(true)
        .fail(function() {
            $form.find('.has-error:first').field().focus()
            $submit.shake()
        })
        .done(function(values) {
            if (!values.iban || !values.swift) return

            $submit.loading(true)

            return api.call('v1/bankAccounts', {
                iban: values.iban,
                swiftbic: values.swift
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


    $el.field('iban').focusSoon()

    return ctrl
}
