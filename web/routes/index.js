var master = require('../controllers/master')
, markets = require('../controllers/markets')
, orders = require('../controllers/orders')
, login = require('../controllers/login')
, register = require('../controllers/register')
, notfound = require('../controllers/notfound')
, dashboard = require('../controllers/dashboard')
, terms = require('../controllers/terms')
, about = require('../controllers/about')
, privacy = require('../controllers/privacy')
, depositbtc = require('../controllers/depositbtc')
, depositnok = require('../controllers/depositnok')
, identity = require('../controllers/identity')
, resetPassword = require('../controllers/resetPassword')
, apiKeys = require('../controllers/apiKeys')
, changepassword = require('../controllers/changepassword')
, createvoucher = require('../controllers/vouchers/create')
, redeemvoucher = require('../controllers/vouchers/redeem')
, vouchers = require('../controllers/vouchers/index')
, depositltc = require('../controllers/depositltc')
, withdraw = require('../controllers/withdraw')
, bankaccounts = require('../controllers/bankaccounts')
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
    .add(/^depositbtc$/, function() {
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
    .add(/^depositltc$/, function() {
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
    .add(/^depositnok$/, function() {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(depositnok(), 'depositnok')
    })

    require('./admin').configure()

    router
    .add(/^(.+)$/, function(hash) {
        master(notfound(hash))
    })
}
