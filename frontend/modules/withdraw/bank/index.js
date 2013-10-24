var format = require('util').format
, _ = require('lodash')
, nav = require('../nav')
, template = require('./index.html')
, sepa = require('../../../assets/sepa.json')

module.exports = function(currency) {
    var $el = $('<div class=withdraw-bank>').html(template())
    , ctrl = {
        $el: $el
    }
    , $form = ctrl.$el.find('form')
    , $account = $form.field('account')
    , amount = require('../../shared/amount-input')({
        currency: currency || api.user.country == 'NO' ? 'NOK' : 'EUR',
        currencies: 'fiat',
        max: 'available',
        maxPrecision: 2
    })

    // Insert amount control
    $el.find('.amount-placeholder').append(amount.$el)

    $el.on('remove', function() {
        amount.$el.trigger('remove')
    })

    // Enumerate bank accounts
    api.bankAccounts()
    .fail(errors.alertFromXhr)
    .done(function(accounts) {
        $el.toggleClass('is-empty', !accounts.length)

        $account.html(_.map(accounts, function(a) {
            return format(
                '<option class="bank-account" value="%s">%s</option>',
                a.id, formatters.bankAccount(a))
        }))
    })

    $form.on('submit', function(e) {
        e.preventDefault()

        if (!amount.validate(true)) return

        api.call('v1/withdraws/bank', {
            amount: amount.value(),
            bankAccount: +$account.val(),
            currency: amount.currency()
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            api.balances()
            router.go('#withdraw/withdraws')
        })
    })

    $el.find('.withdraw-nav').replaceWith(nav('bank').$el)
    $el.toggleClass('is-sepa', !!~sepa.indexOf(api.user.country))

    return ctrl
}
