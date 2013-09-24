/* global describe, it */
var expect = require('expect.js')
, request = require('supertest')
, app = require('../..')
, mock = require('../mock')
, dummy = require('../dummy')

describe('users', function() {
    describe('create', function() {
        it('creates user', function(done) {
            var req = {
                email: dummy.email(),
                key: dummy.hex(64)
            }
            , userId = dummy.number(1, 1e6)

            mock.once(app, 'verifyEmail', function(email, cb) {
                expect(email).to.be(req.email)
                cb(null, true)
            })

            mock.once(app.conn.write, 'query', function(q, cb) {
                expect(q.text).to.match(/create_user\(/)
                expect(q.values).to.eql([
                    req.email,
                    req.key
                ])
                cb(null, {
                    rows: [
                        {
                            uid: userId
                        }
                    ]
                })
            })

            mock.once(app, 'activity', function() {})

            request(app)
            .post('/v1/users')
            .send(req)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err) {
                done(err)
            })
        })
    })

    describe('identity', function() {
        it('allows sample Polish address', function(done) {
            mock.once(app.conn.write, 'query', function(query, cb) {
                cb(null, mock.rows({}))
            })

            var impersonate = mock.impersonate(app, {
                id: 123,
                securityLevel: 2
            })

            request(app)
            .post('/v1/users/identity')
            .send({
                firstName: 'Bartosz',
                lastName: 'Bortnik',
                address: 'Broniewskiego',
                city: 'Rzeszow',
                postalArea: '35-206',
                country: 'PL'
            })
            .expect(204)
            .end(function(err) {
                if (err) return done(err)
                impersonate.restore()
                done()
            })
        })
    })
})
