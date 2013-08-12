var request = require('request')
, _ = require('lodash')
, config = require('konfu')
, key = config.intercom_app_id + ':' + config.intercom_key
, ep = 'https://' + key + '@api.intercom.io/v1/'

exports.createUser = function(user) {
    request.post({
        uri: ep + 'users',
        json: {
            user_id: user.id,
            email: user.email,
            created_at: +new Date() / 1e3
        }
    }, function(err, res, data) {
        if (err) console.error(err)
        console.log(res.statusCode)
        console.log(data)
    })
}

exports.updateUser = function(id, attrs, cb) {
    request.put({
        uri: ep + 'users',
        json: _.extend({
            user_id: id
        }, attrs)
    }, function(err, res, data) {
        if (err) return cb(err)
        if (res.statusCode >= 300) {
            return cb(new Error('Status code ' + res.statusCode))
        }
        cb(null, data)
    })
}

exports.setIdentity = function(id, user) {
    exports.updateUser(id, {
        name: user.firstName + ' ' + user.lastName,
        custom_data: {
            address: user.address,
            country: user.country,
            city: user.city,
            postalArea: user.postalArea
        }
    }, function(err) {
        if (err) console.error(err)
    })
}

exports.setUserPhoneVerified = function(id, number) {
    exports.updateUser(id, {
        custom_data: {
            phone: number
        }
    }, function(err) {
        if (err) console.error(err)
    })
}
