var template = require('./index.html')
, nav = require('../nav')
, _ = require('lodash')

module.exports = function() {
    var $el = $('<div class=account-bankaccounts>').html(template())
    , controller = {
        $el: $el
    }

    function refresh() {
        api.call('v1/bankAccounts')
        .fail(errors.alertFromXhr)
        .done(renderAccounts)
    }

    function renderAccounts(accounts) {
        var $accounts = $el.find('.accounts')
        , itemTemplate = require('./item.html')
        , $items = $.map(accounts, function(a) {
            return $(itemTemplate(_.extend({
                formatted: formatters.bankAccount(a)
            }, a)))
        })
        $accounts.html($items)
    }

    refresh()

    $el.find('.account-nav').replaceWith(nav('bankaccounts').$el)

    return controller
}
