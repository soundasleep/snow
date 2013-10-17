var format = require('util').format
, _ = require('lodash')
, num = require('num')
, nav = require('../nav')
, template = require('./index.html')
, sepa = require('../../../assets/sepa.json')
, wire = require('../../../assets/wire.json')

module.exports = function(currency) {
    var $el = $('<div class=withdraw-bank>').html(template())
    , controller = {
        $el: $el
    }
    , $form = controller.$el.find('form')
    , $amount = $form.field('amount')
    , $currencies = $form.find('.currencies')
    , $currency = $form.field('currency')
    , $account = $form.field('account')

    currency || (currency = api.defaultFiatCurrency())

    api.bankAccounts()
    .fail(errors.alertFromXhr)
    .done(function(accounts) {
        $el.toggleClass('is-empty', !accounts.length)

        $account.html(_.map(accounts, function(a) {
            return format(
                '<option class="bank-account" value="%s">%s</option>',
                a.id, _.escape(formatters.bankAccount(a)))
        }))
    })

    function renderBalances(balances) {
        $currencies.html($.map(balances, function(x) {
            if (!api.currencies[x.currency].fiat) return

            var $li = $(format('<li><a href="#">%s (%s)</a>',
            x.currency, numbers.format(x.available)))
            .attr('data-currency', x.currency)

            return $li.toggleClass('disabled', +x.available === 0)
        }))

        $currency.html(currency)
    }

    if (api.balances.current) renderBalances(api.balances.current)
    else api.once('balances', renderBalances)

    $currencies.on('click', 'li', function(e) {
        e.preventDefault()
        var $li = $(this).closest('li')
        if ($li.hasClass('disabled')) return
        $currency.html($li.attr('data-currency'))
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
            bankAccount: +$account.val(),
            currency: $currency.html()
        })
        .fail(function(err) {
            if (err.name == 'NoFunds') {
                alertify.alert('Amount to withdraw cannot be more ' +
                    'than your available balance')
                return
            }

            errors.alertFromXhr(err)
        })
        .done(function() {
            api.balances()
            router.go('#withdraw/withdraws')
        })
    })

    $el.find('.withdraw-nav').replaceWith(nav('bank').$el)
    var allowed = ~sepa.indexOf(api.user.country) || ~wire.indexOf(api.user.country)
    $el.toggleClass('is-allowed', !!allowed)

    return controller
}
