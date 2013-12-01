/* global TropoWebAPI, TropoJSON */
var debug = require('debug')('snow:phone')
, Tropo = require('tropo')

require('tropo-webapi')

module.exports = exports = function(app) {
    exports.app = app

    if (app.config.tropo_messaging_token && app.config.tropo_voice_token) {
        exports.tropo = new Tropo({
            voiceToken: app.config.tropo_voice_token,
            messagingToken: app.config.tropo_messaging_token
        })

        app.post('/tropo', exports.tropoHandler)
    }

    return exports
}

exports.call = function(number, msg, cb) {
    if (exports.tropo) {
        exports.tropo.call(number, msg, cb)
        return
    }

    console.log('would call to %s: %s', number, msg)
    cb()
}

exports.text = function(number, msg, cb) {
    if (exports.tropo) {
        exports.tropo.message(number, msg, cb)
        return
    }

    console.log('would text to %s: %s', number, msg)
    cb()
}

exports.tropoHandler = function(req, res) {
    var params = req.body.session.parameters

    debug('processing tropo request with params %j', params)

    var method

    if (params.token == req.app.config.tropo_messaging_token) {
        method = 'message'
    }

    if (params.token == req.app.config.tropo_voice_token) {
        method = 'call'
    }

    if (!method) {
        debug('invalid tropo token %s', params.token)
        return res.send(400)
    }

    var tropo = new TropoWebAPI()

    if (method == 'call') {
        tropo.call(params.numberToDial)
        tropo.wait(2000)
        tropo.say(params.msg)
    } else {
        tropo.call(params.number, null, null, null, null, null, 'SMS', null, null, null)
        tropo.say(params.msg)
    }

    var tropoJSON = TropoJSON(tropo)

    debug('sending tropo response %s', tropoJSON)

    res.send(tropoJSON)
}
