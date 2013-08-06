/* global file, directory, task, cat */
var base = 'build'
, common = require('./common')

directory(base)
directory(base + '/img')
directory(base + '/img/flags')

var head = [
    'vendor/raven.min.js',
    'vendor/modernizr.js'
]

var vendor = [
    'components/jquery/jquery.min.js',
    'vendor/jquery.cookie.js',
    'vendor/sjcl.js',
    'components/alertify/alertify.min.js',
    'vendor/bootstrap/js/bootstrap.min.js',
    'components/bootstrap-notify/js/bootstrap-notify.js'
]

task('dist', [
    'client',
    base + '/head.min.js',
    base + '/entry.min.js',
    base + '/styles.min.css',
    base + '/index.min.html',
    base + '/vendor.min.js'
])

task('client', [
    base,
    base + '/head.js',
    base + '/entry.js',
    base + '/vendor.js',
    base + '/styles.css',
    base + '/index.html',
    base + '/img',
    base + '/img/registerbg.jpg',
    base + '/img/icon.png',
    base + '/img/icon-inverse.png',
    base + '/img/flags',
    base + '/img/flags/NO.png',
    base + '/img/flags/US.png'
])

file(base + '/head.js', head, common.concatFiles)
file(base + '/vendor.js', vendor, common.concatFiles)

file(base + '/entry.min.js', [base + '/entry.js'], common.compressJs)
file(base + '/vendor.min.js', [base + '/vendor.js'], common.compressJs)
file(base + '/head.min.js', [base + '/head.js'], common.compressJs)
file(base + '/styles.min.css', [base + '/styles.css'], common.compressCss)

file(base + '/img/registerbg.jpg', ['assets/img/registerbg.jpg'], common.copy)
file(base + '/img/icon.png', ['assets/img/icon.png'], common.copy)
file(base + '/img/icon-inverse.png', ['assets/img/icon-inverse.png'], common.copy)
file(base + '/img/flags/NO.png', ['assets/img/flags/NO.png'], common.copy)
file(base + '/img/flags/US.png', ['assets/img/flags/US.png'], common.copy)

file(base + '/index.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/index.ejs'), {
        minify: false,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/index.min.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/index.ejs'), {
        minify: false,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/index.css', function() {
    common.exec('stylus assets/index.styl -o ' + base)
})

file(base + '/styles.css', [
    'components/alertify/themes/alertify.core.css',
    'components/alertify/themes/alertify.bootstrap.css',
    'vendor/bootstrap/css/bootstrap.min.css',
    'components/bootstrap-notify/css/bootstrap-notify.css',
    'build/index.css'
], common.concatFiles)

file(base + '/entry.js', ['build'].concat(vendor), function() {
    var bundle = common.exec('browserify -d -t ./node_modules/browserify-ejs ./index.js')
    bundle.to(this.name)
})
