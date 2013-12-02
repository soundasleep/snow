/* global Firebase */
if (window.analytics) {
    var lang = $('html').attr('lang')

    window.analytics.page('Landing', {
        language: lang
    })

    analytics.trackLink($('[href="/client/#auth/login"]'), 'Clicked Login')
    analytics.trackLink($('[href="/client/#auth/register"]'), 'Clicked Sign Up')
}

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, '$1 $2')
    return x;
}

$(function() {
    if (window.Firebase) {
        var firebaseName = 'justcoin-dev'
        if (window.environment == 'production') firebaseName = 'justcoin'
        if (window.environment == 'staging') firebaseName = 'justcoin-staging'

        var stats = new Firebase('https://' + firebaseName + '.firebaseIO.com/stats/userCount');
        stats.on('value', function(snapshot) {
            var count = numberWithCommas(snapshot.val())
            $('.user-count').text(count);
        });
    }

    if (window.SVGSVGElement == undefined)
    {
        $(".header .logo").attr('src', '/justcoin.png');
    }
})
