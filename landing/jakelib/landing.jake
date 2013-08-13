/* global task, file, directory, cat */
var base = 'build'
, common = require('./common')

directory('build')

task('dist', [
    'build',
    base + '/vendor.min.js',
    base + '/styles.min.css',
    base + '/index.html',
    base + '/litecoin.png',
    base + '/screenshot.png',
    base + '/norway.jpg',
    base + '/justcoin.png',
    base + '/favicon.png',
    base + '/favicon.ico',
    base + '/touch-icon-ipad-retina.png',
    base + '/touch-icon-iphone-retina.png',
    base + '/touch-icon-iphone.png',
    base + '/tileicon.png'
])

var vendor = [
    'vendor/jquery/jquery-1.10.2.min.js',
    'vendor/highstock.js'
]

file(base + '/vendor.js', vendor, common.concatFiles)

file(base + '/index.css', function() {
    common.exec('stylus index.styl -o build')
})

file(base + '/index.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('index.ejs'), {
        filename: 'index.ejs',
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/vendor.min.js', [base + '/vendor.js'], common.compressJs)
file(base + '/head.min.js', [base + '/head.js'], common.compressJs)
file(base + '/entry.min.js', [base + '/entry.js'], common.compressJs)
file(base + '/styles.min.css', [base + '/styles.css'], common.compressCss)
file(base + '/litecoin.png', ['litecoin.png'], common.copy)
file(base + '/norway.jpg', ['norway.jpg'], common.copy)
file(base + '/screenshot.png', ['screenshot.png'], common.copy)
file(base + '/justcoin.png', ['justcoin.png'], common.copy)
file(base + '/favicon.png', ['favicon.png'], common.copy)
file(base + '/favicon.ico', ['favicon.ico'], common.copy)
file(base + '/touch-icon-ipad-retina.png', ['touch-icon-ipad-retina.png'], common.copy)
file(base + '/touch-icon-iphone-retina.png', ['touch-icon-iphone-retina.png'], common.copy)
file(base + '/touch-icon-iphone.png', ['touch-icon-iphone.png'], common.copy)
file(base + '/tileicon.png', ['tileicon.png'], common.copy)

file(base + '/styles.css', [
    'vendor/bootstrap/css/bootstrap.min.css',
    'vendor/bootstrap/css/bootstrap-responsive.min.css',
    'build/index.css'
], common.concatFiles)
