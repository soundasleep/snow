var master = require('../modules/master')
, markets = require('../modules/markets')
, orders = require('../modules/orders')
, login = require('../modules/login')
, register = require('../modules/register')
, notfound = require('../modules/notfound')
, dashboard = require('../modules/dashboard')
, terms = require('../modules/terms')
, about = require('../modules/about')
, privacy = require('../modules/privacy')
, depositbtc = require('../modules/deposit/btc')
, depositbank = require('../modules/deposit/bank')
, identity = require('../modules/identity')
, resetPassword = require('../modules/resetPassword')
, apiKeys = require('../modules/apiKeys')
, changepassword = require('../modules/changepassword')
, createvoucher = require('../modules/vouchers/create')
, redeemvoucher = require('../modules/vouchers/redeem')
, vouchers = require('../modules/vouchers/index')
, depositltc = require('../modules/deposit/ltc')
, withdraw = require('../modules/withdraw')
, bankaccounts = require('../modules/bankaccounts')
, authorize = require('../authorize')

module.exports = function() {
    router
    .add(/^$/, function() {
        api.once('user', function(user) {
            if (user) {
                master(dashboard())
            } else {
                master(login())
            }
        })
    })
    .add(/^apiKeys$/, function() {
        master(apiKeys(), 'home')
    })
    .add(/^resetPassword$/, function() {
        master(resetPassword(), 'resetPassword')
    })
    .add(/^signOut$/, function() {
        $.removeCookie('apiKey')
        window.location = '/'
    })
    .add(/^markets\/([A-Z]{6})$/, function(id) {
        master(markets(id), 'markets')
    })
    .add(/^register(?:\?after=(.+))?$/, function(after) {
        master(register(after), 'register')
    })
    .add(/^login(?:\?after=(.+))?$/, function(after) {
        master(login(after), 'login')
    })
    .add(/^orders$/, function() {
        if (!authorize.user()) return
        master(orders(), 'orders')
    })
    .add(/^vouchers$/, function() {
        if (!authorize.user()) return
        master(vouchers())
    })
    .add(/^vouchers\/create$/, function() {
        if (!authorize.user()) return
        master(createvoucher())
    })
    .add(/^vouchers\/redeem$/, function() {
        if (!authorize.user()) return
        master(redeemvoucher())
    })
    .add(/^bankaccounts$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(bankaccounts(), 'bankaccounts')
    })
    .add(/^identity(?:\?after=(.+))?$/, function(after) {
        if (!authorize.user()) return
        master(identity(after), 'identity')
    })
    .add(/^deposit\/btc$/, function() {
        if (!authorize.user()) return
        master(depositbtc(), 'depositbtc')
    })
    .add(/^changepassword$/, function() {
        if (!authorize.user()) return
        master(changepassword(), 'changepassword')
    })
    .add(/^terms$/, function() {
        master(terms(), 'terms')
    })
    .add(/^about$/, function() {
        master(about(), 'about')
    })
    .add(/^privacy$/, function() {
        master(privacy(), 'privacy')
    })
    .add(/^deposit\/ltc$/, function() {
        if (!authorize.user()) return
        master(depositltc(), 'depositltc')
    })
    .add(/^withdraw\/([a-z]+)$/, function(type) {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(withdraw(type), 'withdraw')
    })
    .add(/^([a-z0-9]{12})$/i, function(code) {
        if (!authorize.user(true)) return
        master(redeemvoucher(code), 'redeem-voucher')
    })
    .add(/^deposit\/bank$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(depositbank(), 'depositbank')
    })

    router
    .add(/^(.+)$/, function(hash) {
        master(notfound(hash))
    })
}
