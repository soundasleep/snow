var _ = require('lodash')
, debug = require('./debug')('notify')
, activity = require('./activity')

module.exports = function() {
    var $el = $('<div class="notifications bottom-right">')
    , module = {
        $el: $el
    }
    , timer
    , since

    module.show = function(html, duration) {
        duration || (duration = 30e3)

        var n = {
            fadeOut: { enabled: true, delay: duration },
            message: { html: html }
        }
        , notify = $('.bottom-right').notify(n)
        notify.show()
        return notify
    }

    api.on('activities', function(items) {
        if (since === undefined) {
            if (items.length) {
                var item = _.sortBy(items, 'id').pop()
                since = item.id
                debug('initial since = %s', since)
            }
        } else {
            _.each(items, function(item) {
                var phrased = activity(item)
                module.show(phrased)
            })

            if (items.length) {
                debug('%s new items', items.length)
                since = items[items.length - 1].id
                debug('since = %s', since)
            } else {
                debug('no new items')
            }

            timer && clearTimeout(timer)
        }

        setTimeout(function() {
            api.activities(since)
        }, 5e3)
    })

    return module
}
