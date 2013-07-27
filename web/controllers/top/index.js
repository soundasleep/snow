var _ = require('lodash')

module.exports = function() {
    var balanceTemplate = require('./balance.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $summary = controller.$el.find('.account-summary')
    , balancesTimer
    , $balances = $summary.find('.balances')
    , oldBalances

    function balancesChanged(balances) {
        balances = _.filter(balances, function(x) {
            return x.available > 0 || x.currency == 'BTC'
        })

        $balances.html($.map(balances, function(item) {
            return balanceTemplate(item)
        }))

        if (oldBalances) {
            var changed = _.filter(balances, function(x) {
                var ob = _.find(oldBalances, { currency: x.currency })
                return !ob || ob.available != x.available
            })

            _.each(changed, function(x) {
                var $available = $balances.find('.balance[data-currency="' +
                    x.currency + '"] .available')
                $available.addClass('flash')
            })
        }

        oldBalances = balances
    }

    api.on('balances', function(balances) {
        balancesChanged(balances)
        balancesTimer && clearTimeout(balancesTimer)
        balancesTimer = setTimeout(api.balances, 30e3)
    })

    api.on('user', function(user) {
        $summary.find('.email').html(user.email)
        api.balances()
    })

    controller.destroy = function() {
        balancesTimer && clearTimeout(balancesTimer)
    }

    return controller
}
