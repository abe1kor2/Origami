const express = require('express')
const router  = express.Router()
const controller = require("../controllers/controller.js")

//// //// //// //// ACCOUNT ROUTES //// //// //// ////
router.get("/account/create", controller.createAccount);
router.get("/account/delete", controller.deleteAccount);

// GET
router.get("/account/positions", controller.getPositions);
router.get("/account/positions/:symbol", controller.getPosition);
router.get("/account/watchlist", controller.getWatchlist);
router.get("/account/balance/cash", controller.getCash);
router.get("/account/balance/combined", controller.getCombinedBalance);
router.get("/account/balance/market", controller.getMarketBalance);

// POST
router.post("/account/buy", controller.buyShares) // POST should look like {"AAPL" : 40} if you want to buy 40 shares of AAPL
router.post("/account/sell", controller.sellShares) // POST should look like {"AAPL" : 40} if you want to sell 40 shares of AAPL
router.post("/account/watchlist/add", controller.addToWatchlist); // POST should look like {"symbol" : "ARKW"} to add ARKW to the watchlist
router.post("/account/watchlist/remove", controller.removeFromWatchlist); // POST should look like {"symbol" : "ARKW"} to remove ARKW from the watchlist

// PUT
router.put("/account/balance/cash/deposit", controller.depositCash)
router.put('/account/balance/cash/withdraw', controller.withdrawCash)
//// //// //// //// //// //// //// //// //// //// ////


//// //// //// //// FINNHUB API ROUTES //// //// //// 
router.get("/fh/price/:type/:symbol", controller.getPrice); // type: o = open, h = high, l = low, c = current, pc = previous close
router.get("/fh/price/:symbol", controller.getPriceDetailed); // returns ALL of the above types of prices of a stock as JSON
router.get("/fh/volume/:symbol", controller.getVolume); // returns ALL of the above types of prices of a stock as JSON
router.get("/fh/search/:query", controller.searchForSymbol);
//// //// //// //// //// //// //// //// //// //// //// 

module.exports = router
