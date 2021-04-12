const API_KEY = '&token=c11ae4f48v6tj8r9dljg';
const fh = 'https://finnhub.io/api/v1';
const Account = require('../models/Account.js');
const fetch = require('node-fetch');
const validPriceTypes = ["o", "h", "l", "c", "pc"];

const createAccount = async (req, res, next) => {
    await Account.notYetCreated()
    .then(() => {
        Account.init()
        .then((obj) => {
            console.log('server-side: Account created');
            res.send(JSON.stringify((obj)));
        }).catch(next)
    }).catch(next)
    
}

const deleteAccount = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        Account.delete()
        .then((obj) => {
            console.log('server-side: Account deleted');
            res.send(JSON.stringify((obj)));
        }).catch(next)
    }).catch(next)
    
}

const getCash = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        Account.getCash()
        .then((obj) => {
            console.log('server-side: cash: ' +obj+ ' was returned');
            res.send(JSON.stringify((obj)));
        }).catch(next)
    }).catch(next)
}

const getPosition = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        Account.getPosition(req.params.symbol)
        .then((obj) => {
            console.log('server-side: returned ' + req.params.symbol);
            res.send(JSON.stringify(obj, null, 2));
        }).catch(next)
    }).catch(next)
}

const getPositions = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        Account.getPositions()
        .then((obj) => {
            console.log('server-side: '+obj.length+' positions were returned');
            res.send(JSON.stringify(obj, null, 2));
        }).catch(next)
    }).catch(next)
}

const getWatchlist = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        Account.getWatchlist()
        .then((obj) => {
            console.log('server-side: '+obj.length+' watchlist items were returned');
            res.send(JSON.stringify(obj, null, 2));
        }).catch(next)
    }).catch(next)
}

const getPrice = async (req, res, next) => {
    if (!(validPriceTypes.includes(req.params.type)))
    {
        res.status(400);
        return next("ERROR: Invalid price type flag. Try o, h, l, c, or pc");
    }
    await fh_quote(req.params.symbol)
    .then((apiResponse) => {
        console.log("server-side: " + req.params.type + " price of " + req.params.symbol + " is: " + apiResponse[req.params.type]);
        res.send(JSON.stringify(apiResponse[req.params.type]));
    }).catch(next)
}

const getPriceDetailed = async (req, res, next) => {
    await fh_quote(req.params.symbol)
    .then((apiResponse) => {
        console.log("server-side: price report of " + req.params.symbol + " is: " + JSON.stringify(apiResponse));
        res.send(JSON.stringify(apiResponse));
    }).catch(next)
}

const getVolume = async (req, res, next) => {
    await fh_quote(req.params.symbol)
    .then((apiResponse) => {
        console.log("server-side: volume of " + req.params.symbol + " is: " + apiResponse["t"]); // t is the flag for volume
        res.send(JSON.stringify(apiResponse["t"]));
    }).catch(next)
}

const searchForSymbol = async (req, res, next) => {
    await fh_search(req.params.query)
    .then((apiResponse) => {
        console.log("server-side: your query for " + req.params.query + " returned the following result: " + JSON.stringify(apiResponse, null, 2));
        res.send(JSON.stringify(apiResponse, null, 2))
    }).catch(next)
}

const getCombinedBalance = async (req, res, next) => {
	try{
		let positions = await Account.getPositions().catch(next);
		let totalValue = await Account.getCash().catch(next);
		let quote;
		let positionVal;
		for(let i = 0; i < positions.length; i++)
		{
			quote = await fh_quote(positions[i].symbol).catch(next);
			positionVal = quote["c"];
			totalValue += positionVal * positions[i].numShares;
		}
		res.send(totalValue.toFixed(2));
	}
	catch(err)
	{
		next(err);
	}
}

const getMarketBalance = async (req, res, next) => {
	try{
		let positions = await Account.getPositions().catch(next)
		let totalValue = 0;
		let quote;
		let positionVal;
		for(let i = 0; i < positions.length; i++)
		{
			quote = await fh_quote(positions[i].symbol).catch(next)
			positionVal = quote["c"];
			totalValue += positionVal * positions[i].numShares;
		}
		res.send(totalValue.toFixed(2));
	}
	catch(err)
	{
		next(err)
	}
}

const buyShares = async (req, res, next) => { 
    let symbol = Object.keys(req.body)[0]; 
    let shares = req.body[symbol];
    let totalShares = shares;
    if (!isInt(shares) || shares <= 0)
    {
        res.status(400);
        return next("ERROR: Amount of shares to buy must be an integer greater than or equal to 1");
    }
    let currentPosition = await Account.getPosition(symbol).catch((err) => {return undefined})
    let price = await fh_quote(symbol);
    price = parseFloat(price["c"]).toFixed(2); // get 'c' -> current price\
    if (price === 0)
    {
        res.status(400);
        return next("ERROR: Not a valid stock (price === 0)");
    }
    let avgPrice = price; // we calculate this later if there is already a position, otherwise we use the current price
    let cost = price * shares;
    await Account.getCash() // check if the account has enough cash for the transaction
    .then((cash) => {
        if (cost > cash)
        { 
            res.status(400);
            return next("ERROR: Not enough cash to buy " + shares + " shares of " + symbol);
        }
        else
        {
            if (currentPosition !== undefined) 
            {   
                let currentShares = currentPosition["numShares"];
                totalShares += currentShares;
                avgPrice = calculateAveragePrice(currentPosition["avgPrice"], currentShares, price, shares);
            }
            Account.updatePosition(symbol, totalShares, avgPrice) // update the position in the user's account
            .then(() => {
                Account.withdrawCash(cost) // withdraw cash from the user's account
                .then(() => {
                    console.log("server-side: Bought " + shares + " shares of " + symbol + " @ " + price);
                    res.send("Bought " + shares + " shares of " + symbol + " @ " + price);
                }).catch(next)
            }).catch(next)
        }
    }).catch(next)
}

const sellShares = async (req, res, next) => { 
    let symbol = Object.keys(req.body)[0]; 
    let shares = req.body[symbol];
    let currentPosition = await Account.getPosition(symbol).catch((err) => {return undefined})
    let currentShares; let currentAvgPrice; 
    if (currentPosition === undefined) 
    {   
        res.status(400);
        return next("ERROR: There is no position of " + symbol + " in your account to sell");
    }
    else
    {
        currentShares = currentPosition["numShares"];
        if (!isInt(shares) || shares <= 0)
        {
            res.status(400);
            return next("ERROR: Amount of shares to sell must be an integer greater than or equal to 1");
        }
        else if (shares > currentShares)
        {
            res.status(400);
            return next("ERROR: Amount of shares to sell must be less than the amount you currently own");
        }
        else
        {
            currentAvgPrice = currentPosition["avgPrice"];
            totalShares = currentShares - shares;
        }
    }
    let price = await fh_quote(symbol);
    price = parseFloat(price["c"]).toFixed(2); // get 'c' -> current price
    if (price === 0)
    {
        res.status(400);
        return next("ERROR: Not a valid stock (price === 0)");
    }
    let profit = price * shares;
    Account.updatePosition(symbol, totalShares, currentAvgPrice) // update the position in the user's account
    .then(() => {
        Account.depositCash(profit) // deposit cash profit into the user's account
        .then(() => {
            console.log("server-side: Sold " + shares + " shares of " + symbol + " @ " + price);
            res.send("Sold " + shares + " shares of " + symbol + " @ " + price);
        }).catch(next)
    }).catch(next)
}

const depositCash = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        if((!isInt(req.body.amount) && !isFloat(req.body.amount)) || req.body.amount <= 0)
        {
        res.status(400);
        return next("ERROR: Invalid amount. Can only deposit int/float amounts greater than $0");
        }
        Account.depositCash(req.body.amount)
        .then((msg) => {
            console.log(msg);
            res.send(msg);
        }).catch(next);
    }).catch(next)
}

const withdrawCash = async (req, res, next) => {
    await Account.hasBeenCreated()
    .then(() => {
        if((!isInt(req.body.amount) && !isFloat(req.body.amount) || req.body.amount <= 0))
        {
            res.status(400);
            return next("ERROR: Invalid amount value. Can only withdraw int/float amounts greater than 0");
        }
        Account.getCash()
        .then((currentCash) => {
            if (currentCash - req.body.amount < 0)
            {
                res.status(400);
                return next("ERROR: You have insufficient funds to withdraw that amount");
            }
            Account.withdrawCash(req.body.amount)
            .then((msg) => {
                console.log(msg);
                res.send(msg);
            }).catch(next); 
        }).catch(next);
    }).catch(next)
}

const addToWatchlist = async (req, res, next) => {
    let symbol = req.body["symbol"];
    console.log(symbol)
    let price = await fh_quote(symbol); // we can check if the stock exists by checking if the returned price is 0
    price = parseFloat(price["c"]).toFixed(2); // get 'c' -> current price
    if (price === 0.0)
    {
        res.status(400);
        return next("ERROR: Not a valid stock (price === 0)");
    }
    await Account.addToWatchlist(symbol)
    .then((obj) => {
        console.log('server-side: '+symbol+' added to watchlist');
        res.send(JSON.stringify(obj));
    }).catch(next)
}

const removeFromWatchlist = async (req, res, next) => {
    let symbol = req.body["symbol"];
    console.log(symbol)
    let price = await fh_quote(symbol); // we can check if the stock exists by checking if the returned price is 0
    price = parseFloat(price["c"]).toFixed(2); // get 'c' -> current price
    if (price === 0.0)
    {
        res.status(400);
        return next("ERROR: Not a valid stock (price === 0)");
    }
    await Account.removeFromWatchlist(symbol)
    .then((obj) => {
        console.log('server-side: '+symbol+' removed from watchlist');
        res.send(JSON.stringify(obj));
    }).catch(next)
}

async function fh_quote(symbol) {
    let endpoint = "/quote?symbol=" + symbol;
    let response = await fetch(fh + endpoint + API_KEY)
    let json =  await response.json()
    return json;
}

async function fh_search(query) {
    let endpoint = "/search?q=" + query;
    let response = await fetch(fh + endpoint + API_KEY)
    let json =  await response.json()
    return json;
}

function isInt(num) {
    if (typeof num !== 'number')
        return false; 
    return !isNaN(num) && 
        parseInt(Number(num)) == num && 
        !isNaN(parseInt(num, 10));
}

function isFloat(num) {
    if (typeof num !== 'number')
        return false; 
    return !isNaN(num) && 
        parseFloat(Number(num)) == num && 
        !isNaN(parseFloat(num, 10));
}

function calculateAveragePrice(currentPrice, currentNumShares, newPrice, newNumShares) {
    let totalNumShares = currentNumShares + newNumShares;
    return ((currentPrice * currentNumShares) + (newPrice * newNumShares)) / totalNumShares;
}

module.exports = {
    createAccount,
    deleteAccount,
    getCash,
    getPosition,
	getPositions,
    getWatchlist,
    getPrice,
    getPriceDetailed,
    getVolume,
    searchForSymbol,
	getCombinedBalance,
	getMarketBalance,
    depositCash,
	withdrawCash,
    buyShares,
    sellShares,
    addToWatchlist,
    removeFromWatchlist,
}
