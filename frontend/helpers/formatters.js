var format = require('util').format

exports.bankAccount = function(x) {
    console.log(x.iban || x.accountNumber)
    return (x.displayName !== null ? x.displayName + ' (' : '') +
        (x.iban || x.accountNumber) +
        (x.displayName !== null ? ')' : '')
}

exports.escape = function(x) {
    return $('<div>').text(x).html()
}
