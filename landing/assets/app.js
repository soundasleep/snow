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

    var supportsSvg = function() {
        var e = document.createElement('div');
        e.innerHTML = '<svg></svg>';
        return !!(window.SVGSVGElement && e.firstChild instanceof window.SVGSVGElement);
    };

    if (!supportsSvg())
    {
        $(".header .logo").attr('src', '/justcoin.png');
    }
    
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

    $('.flags a[href="#set-language"]').click(function(event){
        event.preventDefault();
        var language = $(this).attr('data-language');
        var path = window.location.pathname;

        if (language == 'nb-NO' && path != '/no/')
            window.location = '/no/';
        else if (language == 'en-US' && path != '/en/')
            window.location = '/en/';
    });
})
