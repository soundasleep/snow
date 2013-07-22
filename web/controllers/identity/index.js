var util = require('util')
, _ = require('lodash')

module.exports = function(after) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $form = $el.find('form')

    var countries = require('../../assets/callingcodes.json')
    , $country = $el.find('.country')
    $country.append(_.map(countries, function(country) {
        return util.format('<option value="%s">%s</option>', country.code, country.name)
    }))

    $form.find('.first-name').focusSoon()

    $form.on('submit', function(e) {
        e.preventDefault()

        var address1 = $el.find('.address1').val()
        , address2 = $el.find('.address2').val()
        , address = address2 ? address1 + '\n' + address2 : address1

        var data = {
            firstName: $el.find('.first-name').val(),
            lastName: $el.find('.last-name').val(),
            address: address,
            city: $el.find('.city').val(),
            postalArea: $el.find('.postal-area').val(),
            country: $el.find('.country').val()
        }

        api.call('v1/users/identity', data)
        .done(function() {
            _.extend(api.user, data)

            if (typeof Intercom != 'undefined' && Intercom) {
                Intercom('update', {
                    name: data.firstName + ' ' + data.lastName,
                    address: data.address,
                    city: data.city,
                    postalArea: data.postalArea,
                    country: data.country
                })
            }

            window.location.hash = '#' + (after || '')
        })
        .fail(function(xhr) {
            errors.alertFromXhr(xhr)
        })
    })

    return controller
}
