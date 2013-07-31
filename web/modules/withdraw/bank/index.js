var format = require('util').format
, _ = require('lodash')
, num = require('num')
, nav = require('../nav')
, template = require('./index.html')

module.exports = function(currency) {
    var $el = $(template())
    , controller = {
        $el: $el
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('.amount')
    , $bankAccount = $form.find('.bank-account')

    currency = 'NOK'

    if (currency !== 'NOK') {
        throw new Error('Expected currency to equal NOK')
    }

    api.call('v1/bankAccounts')
    .fail(errors.alertFromXhr)
    .done(function(accounts) {
        accounts = _.filter(accounts, function(a) {
            return a.verified
        })

        if (!accounts.length) {
            // TODO: use classes for state, not show/hide
            $el.find('.no-bank-accounts').show()
            $el.find('button, .amount, .bank-account').enabled(false)
            return
        }

        $bankAccount.html(_.map(accounts, function(a) {
            return format('<option class="bank-account" value="%s">%s (%s)</option>',
                a.id, a.displayName || 'Unnamed', a.accountNumber)
        }))
    })

    $form.on('submit', function(e) {
        e.preventDefault()

        var amount = numbers.parse($amount.val())

        if (num(amount).get_precision() > 2) {
            alertify.alert('Sorry! Maximum 2 decimals when withdrawing to bank')
            return
        }

        api.call('v1/withdraws/bank', {
            amount: $amount.parseNumber(),
            bankAccount: +$bankAccount.val(),
            currency: currency
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            alert('Request to withdraw received.')
            api.balances()
            window.location.hash = '#'
        })
    })

    $el.find('.withdraw-nav').replaceWith(nav('bank').$el)

    return controller
}
