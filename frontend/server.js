var express = require('express')
, app = express()
, server = require('http').createServer(app)
, proxy = require('http-proxy').createServer(function(req, res, proxy) {
    console.log(req.url)

    if (req.url.match(/^\/api\//)) {
        // remove /api prefix
        req.url = req.url.substr('api'.length + 1)
        return proxy.proxyRequest(req, res, {
            host: 'localhost',
            port: 5071
        })
    }

    if (req.url.match(/^\/admin\//)) {
        // remove /admin prefix
        req.url = req.url.substr('admin'.length + 1)
        return proxy.proxyRequest(req, res, {
            host: 'localhost',
            port: 6072
        })
    }

    proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: 5072
    })
})
proxy.listen(5073)
app.use(express['static']('public'))
server.listen(5072)
console.log('hosting at http://localhost:5073')
