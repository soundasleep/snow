var template = require('./index.html')
, _ = require('lodash')
, nav = require('../nav')

function depthToAccumulative(depth) {
    function toHash(pairs) {
        return _.reduce(pairs, function(p, c) {
            p[c[0]] = c[1]
            return p
        }, {})
    }

    var hash = {
        bids: toHash(depth.bids),
        asks: toHash(depth.asks)
    },
    prices = _.pluck(depth.bids, 0)
    .concat(_.pluck(depth.asks, 0))
    .sort(function(a, b) { return a - b })

    prices = _.filter(prices, function(x) {
        return x >= 100
    })

    var series = {
        bids: _.map(prices, function(p) {
            return [+p, +hash.bids[p] || null]
        }),
        asks: _.map(prices, function(p) {
            return [+p, +hash.asks[p] || null]
        })
    }

    var i

    for (i = 1; i < prices.length; i++) {
        if (!series.asks[i][1]) continue
        series.asks[i][1] += series.asks[i-1][1]
    }

    for (i = prices.length - 2; i >= 0; i--) {
        if (!series.bids[i][1]) continue
        series.bids[i][1] += series.bids[i+1][1]
    }

    return series
}

function vohlcToPrices(vohlc) {
    var prices = []

    // Transform to Highstock format
    for (var i = 0; i < vohlc.length; i++) {
        prices.push([+new Date(vohlc[i].date), +vohlc[i].close])
    }

    return prices
}

function staticDepth() {
    return {"bids":[["616.135","0.50000"],["610.584","1.00000"],["606.000","0.05080"],["601.333","2.00000"],["587.140","1.00000"],["585.914","3.00000"],["580.258","1.00000"],["571.689","1.50000"],["570.890","0.24283"],["564.988","1.50000"],["556.238","1.75000"],["555.076","4.00000"],["549.718","1.75000"],["540.787","2.00000"],["539.657","5.00000"],["534.448","2.00000"],["525.336","3.00000"],["519.178","3.00000"],["431.726","10.00000"],["1.000","0.43000"]],"asks":[["641.400","1.00000"],["648.908","1.00000"],["741.271","1.00000"],["772.157","2.00000"],["800.000","20.00000"],["803.044","3.00000"]]}
}

function splitVohlc(data) {
    var ohlc = [], volume = []

    for (var i = 0; i < data.length; i++) {
        ohlc.push([
            +new Date(data[i].date),
            +data[i].open,
            +data[i].high,
            +data[i].low,
            +data[i].close
        ])

        volume.push([
            +new Date(data[i].date),
            +data[i].volume
        ])
    }

    return { volume: volume, ohlc: ohlc }
}

function staticVohlc() {
    return [{"date":"2013-06-06T00:00:00.000Z","volume":"5.18249","open":"719.295","high":"870.000","low":"719.295","close":"719.893"},{"date":"2013-06-10T00:00:00.000Z","volume":"2.72610","open":"599.160","high":"647.681","low":"599.160","close":"647.681"},{"date":"2013-06-11T00:00:00.000Z","volume":"2.16790","open":"750.000","high":"750.000","low":"615.000","close":"628.637"},{"date":"2013-06-12T00:00:00.000Z","volume":"0.92300","open":"650.000","high":"650.000","low":"650.000","close":"650.000"},{"date":"2013-06-13T00:00:00.000Z","volume":"3.69240","open":"650.000","high":"650.000","low":"650.000","close":"650.000"},{"date":"2013-06-18T00:00:00.000Z","volume":"17.10000","open":"686.270","high":"715.947","low":"539.890","close":"548.000"},{"date":"2013-06-24T00:00:00.000Z","volume":"0.08500","open":"650.000","high":"650.000","low":"650.000","close":"650.000"},{"date":"2013-06-27T00:00:00.000Z","volume":"0.05000","open":"650.000","high":"650.000","low":"650.000","close":"650.000"},{"date":"2013-06-28T00:00:00.000Z","volume":"1.42500","open":"650.000","high":"650.000","low":"650.000","close":"650.000"},{"date":"2013-07-01T00:00:00.000Z","volume":"0.14000","open":"600.000","high":"600.000","low":"600.000","close":"600.000"},{"date":"2013-07-02T00:00:00.000Z","volume":"4.04975","open":"593.425","high":"750.000","low":"567.534","close":"567.534"},{"date":"2013-07-03T00:00:00.000Z","volume":"6.27597","open":"567.534","high":"776.489","low":"502.084","close":"523.225"},{"date":"2013-07-05T00:00:00.000Z","volume":"3.04233","open":"550.000","high":"776.489","low":"550.000","close":"550.000"},{"date":"2013-07-08T00:00:00.000Z","volume":"3.74371","open":"461.257","high":"474.879","low":"446.775","close":"472.563"},{"date":"2013-07-10T00:00:00.000Z","volume":"1.48000","open":"472.000","high":"500.000","low":"472.000","close":"500.000"},{"date":"2013-07-11T00:00:00.000Z","volume":"17.73204","open":"520.741","high":"572.575","low":"486.124","close":"491.997"},{"date":"2013-07-12T00:00:00.000Z","volume":"1.51500","open":"536.071","high":"591.107","low":"503.089","close":"550.415"},{"date":"2013-07-13T00:00:00.000Z","volume":"0.54313","open":"535.152","high":"567.519","low":"493.330","close":"567.519"},{"date":"2013-07-15T00:00:00.000Z","volume":"6.56622","open":"555.824","high":"598.220","low":"510.160","close":"581.128"},{"date":"2013-07-16T00:00:00.000Z","volume":"2.09655","open":"575.624","high":"582.104","low":"540.348","close":"582.000"},{"date":"2013-07-17T00:00:00.000Z","volume":"1.20500","open":"545.006","high":"573.524","low":"523.445","close":"573.524"},{"date":"2013-07-18T00:00:00.000Z","volume":"1.20420","open":"571.126","high":"571.126","low":"499.999","close":"499.999"},{"date":"2013-07-19T00:00:00.000Z","volume":"0.03808","open":"503.317","high":"533.884","low":"503.317","close":"530.000"},{"date":"2013-07-20T00:00:00.000Z","volume":"0.04981","open":"530.000","high":"541.449","low":"530.000","close":"541.449"},{"date":"2013-07-21T00:00:00.000Z","volume":"2.44733","open":"550.000","high":"550.000","low":"486.576","close":"535.557"},{"date":"2013-07-22T00:00:00.000Z","volume":"0.91332","open":"538.000","high":"540.000","low":"511.067","close":"513.960"},{"date":"2013-07-23T00:00:00.000Z","volume":"11.25000","open":"528.960","high":"561.772","low":"479.863","close":"524.675"},{"date":"2013-07-24T00:00:00.000Z","volume":"0.26136","open":"568.591","high":"568.591","low":"568.591","close":"568.591"},{"date":"2013-07-26T00:00:00.000Z","volume":"1.01300","open":"524.913","high":"524.913","low":"522.275","close":"524.913"},{"date":"2013-07-28T00:00:00.000Z","volume":"4.61709","open":"546.000","high":"572.000","low":"546.000","close":"572.000"},{"date":"2013-07-29T00:00:00.000Z","volume":"0.00001","open":"547.267","high":"547.267","low":"547.267","close":"547.267"},{"date":"2013-07-30T00:00:00.000Z","volume":"1.00000","open":"586.004","high":"586.004","low":"586.004","close":"586.004"},{"date":"2013-07-31T00:00:00.000Z","volume":"13.53263","open":"628.459","high":"657.668","low":"618.479","close":"631.726"},{"date":"2013-08-02T00:00:00.000Z","volume":"4.15204","open":"640.369","high":"640.369","low":"631.728","close":"631.728"},{"date":"2013-08-03T00:00:00.000Z","volume":"6.12617","open":"632.776","high":"632.776","low":"572.250","close":"580.000"},{"date":"2013-08-06T00:00:00.000Z","volume":"4.00841","open":"622.000","high":"644.482","low":"583.140","close":"644.482"},{"date":"2013-08-08T00:00:00.000Z","volume":"4.13879","open":"641.356","high":"641.356","low":"607.178","close":"607.178"},{"date":"2013-08-09T00:00:00.000Z","volume":"8.39141","open":"594.737","high":"598.347","low":"592.868","close":"592.868"},{"date":"2013-08-12T00:00:00.000Z","volume":"15.11255","open":"600.000","high":"689.363","low":"600.000","close":"689.363"},{"date":"2013-08-13T00:00:00.000Z","volume":"1.60426","open":"623.000","high":"624.790","low":"623.000","close":"623.000"},{"date":"2013-08-14T00:00:00.000Z","volume":"2.85202","open":"645.000","high":"645.000","low":"645.000","close":"645.000"},{"date":"2013-08-16T00:00:00.000Z","volume":"3.16700","open":"600.000","high":"645.000","low":"583.000","close":"583.000"},{"date":"2013-08-17T00:00:00.000Z","volume":"0.33057","open":"605.000","high":"605.000","low":"605.000","close":"605.000"},{"date":"2013-08-19T00:00:00.000Z","volume":"8.23943","open":"608.000","high":"610.000","low":"605.000","close":"610.000"},{"date":"2013-08-20T00:00:00.000Z","volume":"0.41339","open":"641.027","high":"641.027","low":"641.027","close":"641.027"}]
}

module.exports = function(market) {
    var base = market.substr(0, 3)
    , quote = market.substr(3)
    , $el = $('<div class=trade-stats>').html(template({
        market: market,
        base: base,
        quote: quote
    }))
    , controller = {
        $el: $el
    }

    $el.find('.trade-nav').replaceWith(nav(market, null, 'stats').$el)

    var depth = api.call('v1/markets/' + market + '/depth')

    depth.then(staticDepth).then(depthToAccumulative).done(function(accu) {
        var options = _.clone(require('./book-accu.json'), true)
        options.series[0].data = accu.bids
        options.series[1].data = accu.asks
        options.series[0].name = i18n('trade.stats.accu.buyers', base)
        options.series[1].name = i18n('trade.stats.accu.sellers', base)
        options.title.text = i18n('trade.stats.accu.title', base, quote)
        options.yAxis.title.text = i18n('trade.stats.accu.yAxis', base)
        options.xAxis.title.text = i18n('trade.stats.accu.xAxis', quote, base)

        var $accu = $el.find('.book-accu')
        $accu.highcharts(options)
    })

    var vohlc = api.call('v1/markets/' + market + '/vohlc')
    .then(staticVohlc).then(vohlcToPrices).done(function(prices) {
        var options = _.clone(require('./price-history.json'), true)
        options.series[0].data = prices
        options.title.text = i18n('trade.stats.price history.title', base, quote)
        options.yAxis.title.text = i18n('trade.stats.price history.yAxis', quote, base)
        options.xAxis.title.text = i18n('trade.stats.price history.xAxis')

        var $prices = $el.find('.price-history')
        $prices.highcharts('StockChart', options)
    })

    vohlc.then(staticVohlc).then(splitVohlc).done(function(data) {
        var options = _.clone(require('./vohlc.json'), true)
        options.series[0].data = data.ohlc
        options.series[1].data = data.volume
        options.title.text = i18n('trade.stats.vohlc.title', base, quote)
        options.yAxis[0].title.text = i18n('trade.stats.vohlc.yAxis.price', quote, base)
        options.yAxis[1].title.text = i18n('trade.stats.vohlc.yAxis.volume', base)
        options.xAxis.title.text = i18n('trade.stats.vohlc.xAxis')

        var $vohlc = $el.find('.vohlc')
        $vohlc.highcharts('StockChart', options)
    })

    return controller
}
