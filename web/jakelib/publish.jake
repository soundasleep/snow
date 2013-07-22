/* global task, jake, complete */
var common = require('./common')
, format = require('util').format

function publish(hostname, cb) {
    var files = {
        'build/client/head.js': 'client/head.js',
        'build/client/entry.js': 'client/entry.js',
        'build/client/vendor.js': 'client/vendor.js',
        'build/client/styles.css': 'client/styles.css',
        'build/client/index.html': 'client/index.html',
        'assets/ripple.txt': 'ripple.txt',
        'assets/irba.html': 'irba.html',
        'build/client/img/icon-top-bar.png': 'client/img/icon-top-bar.png',
        'build/client/img/registerbg.jpg': 'client/img/registerbg.jpg',
        'build/client/img/flags/NO.png': 'client/img/flags/NO.png',
        'build/client/img/flags/ES.png': 'client/img/flags/ES.png',
        'build/client/img/flags/US.png': 'client/img/flags/US.png',
        'build/landing/head.js': 'head.js',
        'build/landing/entry.js': 'entry.js',
        'build/landing/vendor.js': 'vendor.js',
        'build/landing/styles.css': 'styles.css',
        'build/landing/index.html': 'index.html',
        'build/landing/logo-top-left.png': 'logo-top-left.png',
        'build/icons/favicon.ico': 'favicon.ico',
        'build/icons/favicon.png': 'favicon.png',
        'build/icons/tileicon.png': 'tileicon.png',
        'build/icons/touch-icon-ipad-retina.png': 'touch-icon-ipad-retina.png',
        'build/icons/touch-icon-iphone-retina.png': 'touch-icon-iphone-retina.png',
        'build/icons/touch-icon-iphone.png': 'touch-icon-iphone.png'
    }

    var cmds = []
    var baseDir = '/home/ubuntu/snow-web/public/'
    var dirs = ['client/img/flags', 'icons']

    cmds = cmds.concat(dirs.map(function(dir) {
        return 'ssh ubuntu@' + hostname + ' mkdir -p ' + baseDir + dir
    }))

    cmds = cmds.concat(Object.keys(files).map(function(fn) {
        var outName = files[fn] || fn
        return format('scp -C %s ubuntu@%s:%s%s', fn, hostname, baseDir, outName)
    }))

    jake.exec(cmds, { printStdout: true, printStderr: true }, cb)
}

// publishing
task('pp', ['publish-prod'])
task('publish-prod', function() {
    process.env.SEGMENT = 'bc0p8b3ul1'
    process.env.BUCKET = 'https://s3-eu-west-1.amazonaws.com/justcoin-production/'

    jake.Task['clean'].invoke()
    jake.Task['default'].invoke()

    publish('10.0.0.184', function(err) {
        if (err) return complete(err)
        var tag = new Date().toISOString().match(/^[^\.]+/)[0].replace(/:/g, '-')
        common.exec('git tag ' + tag)
        complete()
    })
}, { async: true })

task('ps', ['publish-staging'])
task('publish-staging', function() {
    process.env.SEGMENT = '52j6v06i1t'
    process.env.BUCKET = 'https://s3-eu-west-1.amazonaws.com/justcoin-production/'

    jake.Task['default'].on('complete', function() {
        publish('54.217.208.30', complete)
    })

    jake.Task['default'].invoke()

}, { async: true })
