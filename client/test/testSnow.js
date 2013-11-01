/*global describe, it, before, after*/
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var config = require('./configTest.js')();
var num = require('num');
var debug = require('debug')('snowtest')

describe('SnowClient', function () {
    "use strict";
    
    var alice_config = config.alice;
    var bob_config = config.bob;
    var client = new (require('../../client/index'))(alice_config.apikey, config.url, alice_config.email, alice_config.key);
    var client_bob = new (require('../../client/index'))(bob_config.apikey, config.url, bob_config.email);
    var sessionKey;    
    var displayDepth = function(depth){
    	if(!depth){
    		console.error("Invalid depth")
    		return
    	}
    	console.log(depth)
    }
    
    describe('Session', function () {
        it('SessionCreate', function (done) {
        	client.securitySession(function(err, key) {
        		if (err) throw err
        		sessionKey = key
        		debug("securitySession key %s", key)
        		done()
        	});
        });
    });
    
    describe('Markets', function () {
        it('market', function (done) {
        	client.markets(function(err, markets) {
                if (err) throw err
                console.log(client.createTableMarkets(markets).toString())
                done();
            })
        });
    });
    
    describe('Whoami', function () {
        it('WhoamiAlice', function (done) {
        	client.whoami(function(err, user) {
        		if (err) throw err
        		console.log(client.createTableUser(user).toString())
        		done()
        	});
        });
        it('WhoamiBob', function (done) {
        	client_bob.whoami(function(err, user) {
        		if (err) throw err
        		console.log(client.createTableUser(user).toString())
        		done()
        	});
        });        
    });
    
    describe('Depth', function () {
        it('Depth', function (done) {
        	client.depth(config.market, function(err, depth) {
                if (err) throw err
                displayDepth(depth)
                done()
            })
        });
    });

    describe('Balances', function () {
        it('BalancesAlice', function (done) {
        	client.balances(function(err, balances) {
        		if (err) throw err
        		console.log(client.createTableBalances(balances).toString())
        		done()
        	});
        });
        it('BalancesBob', function (done) {
        	client_bob.balances(function(err, balances) {
        		if (err) throw err
        		console.log(client.createTableBalances(balances).toString())
        		done()
        	});
        });
    });

    describe('Orders', function () {
        it('aliceOrders', function (done) {
        	client.orders( function(err, orders) {
        		if (err) throw err
        		console.log(client.createTableOrders(orders).toString())
                done()
            })
        });
        
        it('aliceBid', function (done) {
        	client.order({
                market: config.market,
                type: "bid",
                price: config.bid_price,
                amount: config.volume
            }, function(err, id) {
                if (err) throw err
                debug('Order bid #%s placed', id)
                done()
            })
        });
        it('bobAsk', function (done) {
        	client_bob.order({
                market: config.market,
                type: "ask",
                price: config.ask_price,
                amount: config.volume
            }, function(err, id) {
                if (err) throw err
                debug('Order ask #%s placed', id)
                done()
            })
        });
        it('bobOrders', function (done) {
        	client_bob.orders( function(err, orders) {
        		if (err) throw err
        		console.log(client.createTableOrders(orders).toString())
                done()
            })
        });    
    });
    
    describe('CancelOrders', function () {
    	it('CancelOrdersAlice', function (done) {
    		client.cancelAll(function(err, orderCancelled) {
    			if (err) throw err
    			debug("#orderCancelled: %d", orderCancelled)
    			done()
    		});
    	});
    });
});