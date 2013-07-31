module.exports = function(router, master, authorize) {
    return router
    .add(/^withdraw\/([a-z]+)$/, function(type) {
        if (!authorize.user()) return
        if (!authorize.identity()) return
        master(require('./withdraw')(type))
    })
}
