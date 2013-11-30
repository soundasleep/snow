/* global Firebase */
if (window.analytics) {
    var lang = $('html').attr('lang')

    window.analytics.page('Landing', {
        language: lang
    })

    analytics.trackLink($('[href="/client/#auth/login"]'), 'Clicked Login')
    analytics.trackLink($('[href="/client/#auth/register"]'), 'Clicked Sign Up')
}

$(function() {
    if (window.Firebase) {
        var stats = new Firebase('https://justcoin.firebaseIO.com/stats/userCount');
        stats.on('value', function(snapshot) {
            $('.user-count').text(snapshot.val());
        });
    }
})
