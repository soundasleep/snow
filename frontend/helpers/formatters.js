var format = require('util').format

exports.bankAccount = function(x) {
    if (x.iban && x.routingNumber) {
        return format('%s (%s %s)', x.iban, x.swiftbic, x.routingNumber)
    } else if (x.iban) {
        return format('%s (%s)', x.iban, x.swiftbic)
    } else if (x.swiftbic && x.routingNumber) {
        return format('%s (%s %s)', x.accountNumber, x.routingNumber, x.swiftbic)
    } else if (x.swiftbic) {
        return format('%s (%s)', x.accountNumber, x.swiftbic)
    } else {
        return format('%s', x.accountNumber)
    }
}

exports.escape = function(x) {
    return $('<div>').text(x).html()
}
