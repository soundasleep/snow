/* global analytics, bucket */
module.exports = function() {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $window = $(window)
    , $cta = $el.find('.cta')
    , $tagline = $el.find('.tagline')
    , $signup = $el.find('.signup')
    , taglineRotateTimer = setInterval(rotateTagline, 3.5e3)
    , bv
    , playingLanding
    , taglines = [
        'Your digital currency exchange',
        'Your Bitcoin exchange',
        'Your trusted, open source service',
        'Your Ripple gateway',
        'Your key to the future of money',
        'Your Litecoin exchange'
    ]

    function playLanding() {
        bv.show(bucket + 'landing.mp4', {
            altSource: bucket + 'landing.ogv'
        })
        playingLanding = true
        $el.removeClasses(/is-playing-/).addClass('is-playing-landing')
        resize()
    }

    function playBitcoin() {
        bv.show(bucket + 'what-is-bitcoin.mp4', {
            altSource: bucket + 'what-is-bitcoin.ogv'
        })
        playingLanding = false
        $el.removeClasses(/is-playing-/).addClass('is-playing-bitcoin')
        resize()
    }

    function playRipple() {
        bv.show(bucket + 'what-is-ripple.mp4', {
            altSource: bucket + 'what-is-ripple.ogv'
        })
        playingLanding = false
        $el.removeClasses(/is-playing-/).addClass('is-playing-ripple')
        resize()
    }

    bv = new $.BigVideo()
    bv.init()

    bv.getPlayer().on('ended', playLanding)

    playLanding()

    function rotateTagline() {
        var tagline = taglines.shift()
        taglines.push(tagline)
        $tagline.html(tagline)
        resize()
    }

    function resize() {
        var windowWidth = $window.width()
        , windowHeight = $window.height()

        $cta.css({
            left: windowWidth / 2 - $cta.width() / 2
        })

        if (playingLanding) {
            $cta.css({
                top: windowHeight / 2 - $cta.height() / 2
            })

            $tagline.css({
                fontSize: windowWidth / 30
            })
        }

        if (!playingLanding) {
            $cta.css('top', '')
        }
    }

    $window.on('resize', resize)

    $el.on('click', '.what-is-bitcoin', function(e) {
        e.preventDefault()
        playBitcoin()
    })

    $el.on('click', '.what-is-ripple', function(e) {
        e.preventDefault()
        playRipple()
    })

    if (typeof analytics != 'undefined') {
        analytics.trackLink($signup, 'Clicked Start with Justcoin')
        analytics.trackLink($el.find('.what-is-bitcoin'), 'Clicked What is Bitcoin')
        analytics.trackLink($el.find('.what-is-ripple'), 'Clicked What is Ripple')
    }

    setTimeout(resize, 0)

    controller.destroy = function() {
        taglineRotateTimer && clearInterval(taglineRotateTimer)
        $window.off('resize', resize)
    }

    return controller
}
