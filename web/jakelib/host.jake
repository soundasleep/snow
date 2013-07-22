/* global task */
task('host', ['default'], function() {
    var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , proxy = require('http-proxy').createServer(function(req, res, proxy) {
        if (req.url.match(/^\/api\//)) {
            // remove /api prefix
            req.url = req.url.substr(4)
            return proxy.proxyRequest(req, res, {
                host: 'localhost',
                port: 5071
            })
        }
        if (req.url.match(/^\/$/)) req.url += 'landing'
        proxy.proxyRequest(req, res, {
            host: 'localhost',
            port: 5072
        })
    })
    proxy.listen(5073)
    app.use(express.static('build'))
    server.listen(5072)
    console.log('hosting at http://localhost:5073')
    return server
})
