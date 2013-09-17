/* global describe, it */
var expect = require('expect.js')
, mock = require('../mock')
, dummy = require('../dummy')
, app = require('../..')
, demand = app.security.demand

describe('demand', function() {
    it('defines shorthand methods', function() {
        expect(demand.any).to.be.a('function')
        expect(demand.admin).to.be.a('function')
        expect(demand.deposit).to.be.a('function')
        expect(demand.withdraw).to.be.a('function')
        expect(demand.trade).to.be.a('function')
        expect(demand.primary).to.be.a('function')
    })

    describe('lookup', function() {
        it('uses session key is present', function(done) {
            var req = {
                cookies: {
                    session: dummy.hex(64)
                }
            }

            mock.once(app.security.session, 'lookup', function(id) {
                expect(id).to.be(req.cookies.session)
                done()
            })

            demand.lookup(req)
        })

        it('uses key if theres no session', function(done) {
            var req = {
                query: {
                    key: dummy.hex(64)
                },
                cookies: {}
            }

            mock.once(app.security.keys, 'lookup', function(id) {
                expect(id).to.be(req.query.key)
                done()
            })

            demand.lookup(req)
        })

        it('uses fails if theres no key or session', function(done) {
            var req = {
                query: {},
                cookies: {}
            }
            , res = {
                send: function(code, data) {
                    expect(code).to.be(401)
                    expect(data.name).to.be('NotAuthenticated')
                    done()
                }
            }

            demand.lookup(req, res)
        })
    })

    describe('handler', function() {
        it('attaches user to request', function(done) {
            var session  = {}
            , req = {}
            , res = {}

            mock.once(demand, 'lookup', function(req, res, cb) {
                cb(null, session)
            })

            mock.once(demand, 'demand', function(s, type, level, req, rex, cb) {
                expect(s).to.be(session)
                expect(type).to.be('primary')
                expect(level).to.be(0)
                expect(req).to.be(req)
                expect(res).to.be(res)
                cb()
            })

            demand.handler('primary', 0, req, res, function(err) {
                if (err) return done(err)
                expect(req.user).to.be(session)
                done()
            })
        })
    })

    describe('demand', function() {
        it('denies suspended users', function(done) {
            var req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('UserSuspended')
                done()
            })

            demand.demand({ suspended: true }, 'primary', 0, req, res)
        })

        it('requires tfa for primary', function(done) {
            var session = { tfaSecret: 'secret', primary: true }
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('OtpRequired')
                done()
            })

            demand.demand(session, 'primary', 0, req, res)
        })

        it('does not require tfa for non-primary', function(done) {
            var session = { tfaSecret: 'secret', primary: false }
            , req = {}
            , res = {}

            demand.demand(session, 'any', 0, req, res, done)
        })

        it('disallows using non-primary when demanding primary', function(done) {
            var session = {}
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('SessionRequired')
                done()
            })

            demand.demand(session, 'primary', 0, req, res)
        })

        it('requires primary for admin', function(done) {
            var session = { admin: true }
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('SessionRequired')
                done()
            })

            demand.demand(session, 'admin', 0, req, res)
        })

        it('denies too low security level', function(done) {
            var session = { level: 1, trade: true }
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('SecurityLevelTooLow')
                done()
            })

            demand.demand(session, 'any', 2, req, res)
        })

        it('accepts high enough security level', function(done) {
            var session = { level: 2, trade: true }
            , req = {}
            , res = {}

            demand.demand(session, 'any', 1, req, res, done)
        })

        it('checks trade permission', function(done) {
            var session = {}
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('PermissionRequired')
                done()
            })

            demand.demand(session, 'trade', 2, req, res)
        })

        it('checks withdraw permission', function(done) {
            var session = {}
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('PermissionRequired')
                done()
            })

            demand.demand(session, 'withdraw', 2, req, res)
        })

        it('checks deposit permission', function(done) {
            var session = { trade: true, withdraw: true, admin: true, level: 4 }
            , req = {}
            , res = {}

            mock.once(res, 'send', function(code, data) {
                expect(code).to.be(401)
                expect(data.name).to.be('PermissionRequired')
                done()
            })

            demand.demand(session, 'deposit', 2, req, res)
        })

        it('extends session for primary', function(done) {
            var session = { primary: true }
            , req = {
                cookies: {
                    'session': 'key'
                }
            }
            , res = {}

            mock.once(app.security.session, 'extend', function(key, cb) {
                expect(key).to.be('key')
                expect(cb).to.be.a('function')
                done()
            })

            demand.demand(session, 'primary', 0, req, res, function() {
            })
        })
    })
})
