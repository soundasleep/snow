var _ = require('lodash')

module.exports = exports = function() {
    var validator = $.when.apply($, _.toArray(arguments))
    return validator
}
