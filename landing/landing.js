function updateChart(market) {
    $.getJSON('/api/v1/markets/' + market + '/vohlc', function(data) {
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

        var groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]];

        // create the chart
        $('#vohlc').highcharts('StockChart', {
            chart: {
                animation: false,
                backgroundColor: 'transparent'
            },

            rangeSelector: {
                selected: 1
            },

            "navigator": {
                enabled: false
            },

            title: {
                text: 'Justcoin ' + market.substr(0, 3) + '/' + market.substr(3)
            },

            credits: {
                href: 'https://justcoin.com',
                text: 'Justcoin'
            },

            yAxis: [{
                title: {
                    text: 'Price'
                },
                height: 300,
                lineWidth: 2,
                opposite: true
            }, {
                title: {
                    text: 'Volume'
                },
                height: 300,
                lineWidth: 2
            }],

            series: [{
                type: 'candlestick',
                name: 'Price',
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                },
                color: '#F13A2F',
                upColor: '#7EB3B5'
            }, {
                type: 'line',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                },
                color: '#07415B'
            }]
        });
    })
}

var lastMarkets
, sortOrder = ['BTCNOK', 'BTCEUR', 'BTCLTC', 'BTCXRP']

function fetchMarkets() {
    return $.ajax({
        url: '/api/v1/markets',
        qs: {
            ts: +new Date()
        }
    }).fail(function(xhr) {
        try {
            console.error('Unable to refresh tickers: ' + xhr.responseText)
        } catch (e) {
        }
    }).always(function() {
        setTimeout(fetchMarkets, 10e3)
    }).done(function(markets) {
        markets.sort(function(a, b) {
            return sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id)
        })

        if (!lastMarkets) {
            $('.ticker-stock').html($.map(markets, function(m) {
                return '<option value=' + m.id + '>' + m.id + '</option>'
            }).join(''))
        }

        lastMarkets = markets

        paintTicker()
    })
}

$('.ticker-stock').on('change', function() {
    selectedMarket()
})

function paintTicker() {
    $.each(lastMarkets, function(i, market) {
        if (market.id != $('.ticker-stock').val()) return

        $.each(['last', 'high', 'low', 'volume'], function(i, name) {
            $('.ticker-type-' + name).html(market[name])
        })
    })
}

function selectedMarket() {
    paintTicker()

    if ($app.hasClass('is-showing-chart')) {
        updateChart($('.ticker-stock').val())
    }
}

var $app

$(function() {
    $app = $('body')

    fetchMarkets()
    .done(function() {
        $app.addClass('has-fetched-markets')
    })
})

if (window.analytics) {
    analytics.trackLink($('.btn-login'), 'Clicked Login')

    var signups = ['main', 'screenshot', 'bitcoin', 'ripple', 'litecoin', 'about']

    $.each(signups, function(i, which) {
        analytics.trackLink($('.signup-' + which), 'Clicked Sign Up', {
            which: which
        })
    })

    analytics.trackLink($('.terms'), 'Clicked Terms')
    analytics.trackLink($('.privacy'), 'Clicked Privacy')
    analytics.trackLink($('.support'), 'Clicked Support')
}

$('[data-action="show-chart"]').on('click', function(e) {
    e.preventDefault()
    $app.toggleClass('is-showing-chart')
    updateChart($('.ticker-stock').val())
})

$('[data-action="hide-chart"]').on('click', function(e) {
    e.preventDefault()
    $app.toggleClass('is-showing-chart')
})
