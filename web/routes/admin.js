var adminBalances = require('../controllers/admin/balances')
, adminUsers = require('../controllers/admin/users')
, adminUser = require('../controllers/admin/user')
, adminWithdraws = require('../controllers/admin/withdraws')
, adminUserBankAccounts = require('../controllers/admin/user/bankaccounts')
, adminUserWithdrawRequests = require('../controllers/admin/user/withdrawrequests')
, adminUserAccounts = require('../controllers/admin/user/accounts')
, adminUserActivity = require('../controllers/admin/user/activity')
, adminUserBankCredit = require('../controllers/admin/user/bankcredit')
, admin = require('../controllers/admin')
, authorize = require('../authorize')
, master = require('../controllers/master')

module.exports = {
    configure: function() {
        router
        .add(/^admin$/, function() {
            if (!authorize.admin()) return
            master(admin(), 'admin')
        })
        .add(/^admin\/users\/(\d+)$/, function(userId) {
            if (!authorize.admin()) return
            master(adminUser(userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/bank-accounts$/, function(userId) {
            if (!authorize.admin()) return
            master(adminUserBankAccounts(userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/accounts$/, function(userId) {
            if (!authorize.admin()) return
            master(adminUserAccounts(userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/withdraw-requests$/, function(userId) {
            if (!authorize.admin()) return
            master(adminUserWithdrawRequests(userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/activity$/, function(userId) {
            if (!authorize.admin()) return
            master(adminUserActivity(userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/bank-credit$/, function(userId) {
            if (!authorize.admin()) return
            master(adminUserBankCredit(userId), 'admin')
        })
        .add(/^admin\/balances$/, function() {
            if (!authorize.admin()) return
            master(adminBalances(), 'admin')
        })
        .add(/^admin\/users$/, function() {
            if (!authorize.admin()) return
            master(adminUsers(), 'admin')
        })
        .add(/^admin\/withdraws$/, function() {
            if (!authorize.admin()) return
            master(adminWithdraws(), 'admin')
        })
    }
}
