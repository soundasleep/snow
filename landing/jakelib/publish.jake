/* global task, jake, complete */
var common = require('./common')
, format = require('util').format

function publish(hostname, cb) {
    var files = {
        'build/vendor.min.js': 'vendor.min.js',
        'build/styles.min.css': 'styles.min.css',
        'build/index.html': 'index.html',
        'build/vann.jpg': 'vann.jpg',
        'build/litecoin.png': 'litecoin.png',
        'build/justcoin.png': 'justcoin.png',
        'build/screenshot.png': 'screenshot.png',
        'build/favicon.png': 'favicon.png',
        'build/favicon.ico': 'favicon.ico',
        'build/touch-icon-ipad-retina.png': 'touch-icon-ipad-retina.png',
        'build/touch-icon-iphone-retina.png': 'touch-icon-iphone-retina.png',
        'build/touch-icon-iphone.png': 'touch-icon-iphone.png',
        'build/tileicon.png': 'tileicon.png'
    }

    var cmds = []
    var baseDir = '/home/ubuntu/snow-web/public/'
    var dirs = []

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

    jake.Task['default'].invoke()

    jake.Task['default'].on('complete', function() {
        publish('10.0.0.184', complete)
    })
}, { async: true })

task('ps', ['publish-staging'])
task('publish-staging', function() {
    process.env.SEGMENT = '52j6v06i1t'

    jake.Task['default'].on('complete', function() {
        publish('54.217.208.30', complete)
    })

    jake.Task['default'].invoke()

}, { async: true })
