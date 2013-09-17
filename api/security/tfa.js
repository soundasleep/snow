var assert = require('assert')
, debug = require('debug')('snow:security:tfa')

module.exports = exports = function(app) {
    exports.app = app
    exports.speakeasy = require('speakeasy')
    exports.usedOtp = []
    return exports
}

/**
 * Consume a one-time password
 * @param  {string} key   The two-factor key/secret
 * @param  {string} guess       User supplied otp
 * @return {boolean}            Null if the user is locked out,
 *                              else whether the guess was corrected
 */
exports.consume = function(key, guess) {
    assert.equal(guess.length, 6)

    var answer = exports.speakeasy.time({ key: key, encoding: 'base32' })
    assert.equal(answer.length, 6)

    if (~exports.usedOtp.indexOf(key + answer)) {
        return null
    }

    exports.usedOtp.push(key + answer)

    if (exports.usedOtp.length > 10000) {
        exports.usedOtp.shift()
    }

    debug('expected otp %s, received %s', answer, guess)

    return guess == answer
}
