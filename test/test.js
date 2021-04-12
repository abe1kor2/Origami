var assert = require('assert');
const Account = require('../models/Account.js');
const mongo = require('../utils/db');
const fetch = require('node-fetch');
const request = require('request');
const myurl = 'http://localhost:3000';  

var db;
// This method runs once and connects to the mongoDB
before(async function() {
	try {
		db = await mongo.connectToDB();
	}catch(err){
		throw err;
	}
});
// this method will close your connection to MongoDB after the tests
after(async function() {
    try{
        mongo.closeDBConnection();
    }catch(err){
        throw err;
    }
});

describe("Testing Origami", async function(){
    describe("Testing GET API routes", function(){
        it("Success 1 - GET /account/create", function(){
            fetch(myurl+"/account/create")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });
        
        it("Success 2 - GET /account/positions", function(){
            fetch(myurl+"/account/positions")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 3 - GET /account/positions/:symbol", function(){
            fetch(myurl+"/account/positions/AAPL")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 4 - GET /account/watchlist", function(){
            fetch(myurl+"/account/watchlist")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 5 - GET /account/balance/cash", function(){
            fetch(myurl+"/account/balance/cash")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 6 - GET /account/balance/combined", function(){
            fetch(myurl+"/account/balance/combined")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 7 - GET /account/balance/market", function(){
            fetch(myurl+"/account/balance/market")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 8 - GET /fh/price/:type/:symbol", function(){
            fetch(myurl+"/fh/price/c/SPCE")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 9 - GET /fh/price/:symbol", function(){
            fetch(myurl+"/fh/price/SPCE")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 10 - GET /fh/volume/:symbol", function(){
            fetch(myurl+"/fh/volume/SPCE")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });

        it("Success 11 - GET /fh/search/:query", function(){
            fetch(myurl+"/fh/search/SPCE")
            .then((response) => {
                assert.strictEqual(response.status, 200)
            })
        });


        it("Fail 1 - GET /account/create", function(){
            fetch(myurl+"/account/create")
            .then((response) => {
                assert.strictEqual(response.status, 500)
            })
        });
        
        it("Fail 2 - GET /account/positions", function(){
            fetch(myurl+"/account2/positions")
            .then((response) => {
                assert.strictEqual(response.status, 404)
            })
        });

        it("Fail 3 - GET /account/positions/:symbol", function(){
            fetch(myurl+"/account/positions/agn4ngh")
            .then((response) => {
                assert.strictEqual(response.status, 400)
            })
        });

        it("Fail 4 - GET /account/watchlist", function(){
            fetch(myurl+"/account/watchlist1")
            .then((response) => {
                assert.strictEqual(response.status, 404)
            })
        });

        it("Fail 5 - GET /account/balance/cash", function(){
            fetch(myurl+"/account/balance/mycash")
            .then((response) => {
                assert.strictEqual(response.status, 500)
            })
        });

        it("Fail 6 - GET /account/balance/combined", function(){
            fetch(myurl+"/account/balance/totalcombined")
            .then((response) => {
                assert.strictEqual(response.status, 500)
            })
        });

        it("Fail 7 - GET /account/balance/market", function(){
            fetch(myurl+"/account/balance/marketbalance")
            .then((response) => {
                assert.strictEqual(response.status, 500)
            })
        });

        it("Fail 8 - GET /fh/price/:type/:symbol", function(){
            fetch(myurl+"/fh/price/gg/SPCE")
            .then((response) => {
                assert.strictEqual(response.status, 400)
            })
        });

        it("Fail 9 - GET /fh/price/:symbol", function(){
            fetch(myurl+"/fh/price/n35hn")
            .then((response) => {
                assert.strictEqual(response.status, 400)
            })
        });

        it("Fail 10 - GET /fh/volume/:symbol", function(){
            fetch(myurl+"/fh/volume/j254hj")
            .then((response) => {
                assert.strictEqual(response.status, 400)
            })
        });

        it("Fail 11 - GET /fh/search/:query", function(){
            fetch(myurl+"/fh/search/for/SPCE")
            .then((response) => {
                assert.strictEqual(response.status, 500)
            })
        });
    });

    describe("Testing POST API routes", function(){
        it("Success 1 - POST /account/buy", function(){
            let data = {
                "SPCE" : 5
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/buy',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })

        it("Success 2 - POST /account/sell", function(){
            let data = {
                "SPCE" : 5
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/sell',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })

        it("Success 3 - POST /account/watchlist/add", function(){
            let data = {
                "symbol" : "ARKW"
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/watchlist/add',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })

        it("Success 4 - POST /account/watchlist/remove", function(){
            let data = {
                "symbol" : "ARKW"
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/watchlist/remove',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })


        it("Fail 1 - POST /account/buy", function(){
            let data = {
                "SPCE" : "shares"
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/buy',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 400);
            });
        })

        it("Fail 2 - POST /account/sell", function(){
            let data = {
                "SPCE" : -140
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/sell',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 400);
            });
        })

        it("Fail 3 - POST /account/watchlist/add", function(){
            let data = {
                "symbol" : 420
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/watchlist/add',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 400);
            });
        })

        it("Fail 4 - POST /account/watchlist/remove", function(){
            let data = {
                "symbol" : "SYMBOL"
            };
            request.post({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/watchlist/remove',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 400);
            });
        })
    })

    describe("Testing PUT API routes", function(){
        it("Success 1 - PUT /account/balance/cash/deposit", function(){
            let data = {
                "amount" : 100
            };
            request.put({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/balance/cash/deposit',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })

        it("Success 2 - PUT /account/balance/cash/withdraw", function(){
            let data = {
                "amount" : 100
            };
            request.put({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/balance/cash/withdraw',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })

        it("Fail 1 - PUT /account/balance/cash/deposit", function(){
            let data = {
                "amount" : -100
            };
            request.put({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/balance/cash/deposit',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })

        it("Fail 2 - PUT /account/balance/cash/withdraw", function(){
            let data = {
                "amount" : 100
            };
            request.put({
                headers: {'content-type': 'application/json'},
                url:     myurl+'/account/balance/cash/deposit',
                body:    JSON.stringify(data)        
            }, function(error, response, body){
                assert.strictEqual(response.statusCode, 200);
            });
        })
    })
})