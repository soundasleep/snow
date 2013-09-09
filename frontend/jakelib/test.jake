/*
// testing
var server

task('test', ['test-host'], function() {
    jake.exec('mocha-phantomjs -R spec http://localhost:5074/test.html', function(res) {
        server.close()
        complete()
    }, {
        printStdout: true
    })
}, { async: true })

file('build/test.html', ['test/support/tests.html'], cpTask)
file('build/test.css', ['node_modules/mocha/mocha.css'], cpTask)

cp('-f', 'test/support/tests.html', 'build/test/index.html')

task('test-host', ['build/test.js', 'build/test.html'], function() {
    var express = require('express')
    , app = express()
    server = require('http').createServer(app)
    app.use(express.static('build'))
    server.listen(5074)
})

file('build/test.js', ['build'].concat(vendor), function() {
    var deps = vendor.slice()
    deps.push('./node_modules/mocha/mocha.js')

    var v = deps.reduce(function(p, c) {
        return p + ';' + cat(c)
    }, '')
    , bundle = exec('browserify -d -t ./node_modules/browserify-ejs ./test/index.js')
    , scripts = v + ';' + bundle
    scripts.to(this.name)
})*/
