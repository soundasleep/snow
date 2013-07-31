
module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $address = controller.$el.find('.address')

    api.once('bitcoinAddress', function(address) {
        $address.html($('<a href="bitcoin:' + address + '">' + address + '</a>'))
    })

    api.bitcoinAddress.value || api.bitcoinAddress()

    return controller
}
