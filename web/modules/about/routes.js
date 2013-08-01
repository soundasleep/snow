module.exports = function(router, master) {
    return router
    .add(/^(?:about\/)?(?:company|about)$/, function() {
        master(require('./company')())
    })
    .add(/^(?:about\/)?privacy$/, function() {
        master(require('./privacy')())
    })
    .add(/^(?:about\/)?terms$/, function() {
        master(require('./terms')())
    })
}
