/* global task, jake, complete */
var common = require('./common')
, format = require('util').format

function publish(hostname, cb) {
    var files = {
        'build/head.js': 'client/head.js',
        'build/entry.js': 'client/entry.js',
        'build/vendor.js': 'client/vendor.js',
        'build/styles.css': 'client/styles.css',
        'build/index.html': 'client/index.html',
        'assets/ripple.txt': 'ripple.txt',
        'assets/irba.html': 'irba.html',
        'build/img/registerbg.jpg': 'client/img/registerbg.jpg',
        'build/img/icon.png': 'client/img/icon.png',
        'build/img/justcoin-footer.png': 'client/img/justcoin-footer.png',
        'build/img/flags/NO.png': 'client/img/flags/NO.png',
        'build/img/flags/US.png': 'client/img/flags/US.png'
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
