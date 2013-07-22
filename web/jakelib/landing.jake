/* global task, file, directory, cat */
var base = 'build/landing'
, common = require('./common')

var head = [
    'vendor/raven.js',
    'vendor/modernizr.js'
]

directory('build/landing')
directory('build/icons')

file('build/icons/favicon.ico', ['assets/icons/favicon.ico'], common.copy)
file('build/icons/favicon.png', ['assets/icons/favicon.png'], common.copy)
file('build/icons/tileicon.png', ['assets/icons/tileicon.png'], common.copy)
file('build/icons/touch-icon-ipad-retina.png', ['assets/icons/touch-icon-ipad-retina.png'], common.copy)
file('build/icons/touch-icon-iphone-retina.png', ['assets/icons/touch-icon-iphone-retina.png'], common.copy)
file('build/icons/touch-icon-iphone.png', ['assets/icons/touch-icon-iphone.png'], common.copy)
file(base + '/logo-top-left.png', ['assets/landing/logo-top-left.png'], common.copy)

task('landing', [
    'build',
    base,
    base + '/vendor.js',
    base + '/entry.js',
    base + '/styles.css',
    base + '/head.js',
    base + '/index.html',
    base + '/entry.js',
    base + '/logo-top-left.png',
    'build/icons',
    'build/icons/favicon.ico',
    'build/icons/favicon.png',
    'build/icons/tileicon.png',
    'build/icons/touch-icon-ipad-retina.png',
    'build/icons/touch-icon-iphone-retina.png',
    'build/icons/touch-icon-iphone.png'
])

task('landing-dist', [
    'landing',
    base + '/vendor.min.js',
    base + '/styles.min.css',
    base + '/head.min.js',
    base + '/entry.min.js',
    base + '/index.min.html',
    base + '/entry.min.js',
    base + '/logo-top-left.png',
    'build/icons',
    'build/icons/favicon.ico',
    'build/icons/favicon.png',
    'build/icons/tileicon.png',
    'build/icons/touch-icon-ipad-retina.png',
    'build/icons/touch-icon-iphone-retina.png',
    'build/icons/touch-icon-iphone.png'
])

var vendor = [
    'components/jquery/jquery.min.js',
    'vendor/bigvideo/jquery-ui-1.8.22.custom.min.js',
    'vendor/bigvideo/video.js',
    'vendor/bigvideo/jquery.imagesloaded.min.js',
    'vendor/bigvideo/bigvideo.js',
    'vendor/jquery.cookie.js'
]

file(base + '/head.js', head, common.concatFiles)
file(base + '/vendor.js', vendor, common.concatFiles)

file(base + '/index.css', function() {
    common.exec('stylus assets/landing/index.styl -o build/landing');
})

process.env.BUCKET = 'https://s3-eu-west-1.amazonaws.com/justcoin-production/'

file(base + '/index.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/landing/index.ejs'), {
        minify: false,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/index.min.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/landing/index.ejs'), {
        minify: true,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/styles.css', [base + '/index.css'], common.concatFiles)

file(base + '/vendor.min.js', [base + '/vendor.js'], common.compressJs)
file(base + '/head.min.js', [base + '/head.js'], common.compressJs)
file(base + '/entry.min.js', [base + '/entry.js'], common.compressJs)
file(base + '/styles.min.css', [base + '/styles.css'], common.compressCss)

file(base + '/entry.js', function() {
    var bundle = common.exec('browserify -d -t ./node_modules/browserify-ejs ./landing.js')
    bundle.to(this.name)
})
