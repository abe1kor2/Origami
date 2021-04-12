const Validator = require("validatorjs")
const app = require('../app');

class Account
{
    constructor()
    {
    }

    static async init()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            let doc = {
                "cash": 0,
                "positions": [],
                "watchlist": [] 
            };
            collection.insertOne(doc, (err, obj) => {
                if (err)
                {reject(err)}
                else
                {
                    resolve("Successfully initialized account")
                }
            })
        })
    }

    static async delete()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            collection.remove({});
            resolve("Successfully deleted account")
        })
    }

    // return user's cash value as JSON
    static async getCash()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            collection.find({}).toArray((err, items)=>{
				if (err) 
					{reject(err)}
				else
					{resolve(items[0].cash)}
            });
        });
    }
    
    // return JSON array of all held positions (stocks owned)
    static async getPosition(symbol)
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
			collection.find({}).toArray((err, items)=>{
                if (err)
                    {reject(err)}
                else
                {
                    let position = items[0].positions.find(obj => {return obj.symbol === symbol})
                    if(!position) reject("No position found for " + symbol);
                    else resolve(position)
                }
            });
        });
    }

    // return JSON array of all held positions (stocks owned)
    static async getPositions()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
			collection.find({}).toArray((err, items)=>{
				if (err) 
					{reject(err)}
				else
					{resolve(items[0].positions)}
            });
        });
    }

    static async getWatchlist()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
			collection.find({}).toArray((err, items)=>{
				if (err) 
					{reject(err)}
				else
					{resolve(items[0].watchlist)}
            });
        });
    }

    static async addToWatchlist(symbol)
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            await collection.find({}).toArray((err, items)=>{
                if (err)
                    {reject(err)}
                else
                {
                    let position = items[0].watchlist.find(obj => {return obj.symbol === symbol})
                    if(position === undefined) // if there is no position in the account for this symbol, add it to the array
                    {
                        collection.updateOne({}, { $push: { "watchlist" : {"symbol" : symbol}}}, (err, obj) => {
                            if (err) {reject(err)}
                            else
                            {
                                resolve(symbol + " successfully added to the watchlist");
                            }
                        })
                    }
                    else
                    {
                        reject("ERROR: Watchlist item already present");
                    }
                }
            });
        });
    }

    static async removeFromWatchlist(symbol)
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            await collection.find({}).toArray((err, items)=>{
                if (err)
                    {reject(err)}
                else
                {
                    let position = items[0].watchlist.find(obj => {return obj.symbol === symbol})
                    if(position === undefined) // if there is no position in the account for this symbol, add it to the array
                    {
                        reject("ERROR: " + symbol + " does not exist in the watchlist");
                    }
                    else
                    {
                        collection.updateOne({"watchlist.symbol" : symbol}, { $pull: { "watchlist" : {"symbol" : symbol}}}, (err, obj) => {
                            if (err) {reject(err)}
                            else
                            {
                                resolve(symbol + " successfully removed from the watchlist");
                            }
                        })
                    }
                }
            });
        });
    }
    
    // deposits cash in a user's account
    static async depositCash(cashToAdd)
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            await collection.find({}).toArray((err, items)=>{
                if (err) 
                    {reject(err)}
                else{
                    let curCash = items[0].cash;
                    let newAmount = curCash + cashToAdd;
                    console.log("newAmount = " + newAmount)
                    collection.updateOne({}, { $set: {"cash" : newAmount}}, (err, obj) => {
                        if (err)
                        {reject(err)}
                        else
                        {
                            resolve("$" + cashToAdd + " was deposited in your account.");
                        }
                    })
                }
            })
        });
    }

    // withdraws cash from a user's account
    static async withdrawCash(cashToWithdraw)
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            let curCash;
            collection.find({}).toArray((err, items)=>{
                if (err) 
                    {reject(err)}
                else
                {
                    curCash = items[0].cash;
                    let newAmount = curCash - cashToWithdraw;
                    if(newAmount < 0)
                    {
                        reject("Insufficient funds to withdraw. Current Balance: $" + curCash);
                    }
                    collection.updateOne({}, { $set: {"cash" : newAmount}}, (err, obj) => {
                        if (err)
                        {reject(err)}
                        else
                        {
                            resolve("$" + cashToWithdraw + " was withdrawn from your account. Remaining balance: $" + newAmount);
                        }
                    })
                }
            })
        });
    }

    // update a position held by the user 
    static async updatePosition(symbol, numShares, avgPrice)
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            await collection.find({}).toArray((err, items)=>{
                if (err)
                    {reject(err)}
                else
                {
                    let position = items[0].positions.find(obj => {return obj.symbol === symbol})
                    if(position === undefined) // if there is no position in the account for this symbol, add it to the array
                    {
                        collection.updateOne({}, { $push: { "positions" : {"symbol" : symbol, "numShares" : numShares, "avgPrice" : avgPrice}}}, (err, obj) => {
                            if (err) {reject(err)}
                            else
                            {
                                resolve()
                            }
                        })
                    }
                    else
                    {
                        if (numShares === 0) // get rid of this position from the array if there are 0 shares
                        {
                            collection.updateOne({"positions.symbol" : symbol}, { $pull: { "positions" : { "symbol" : symbol }}}, (err, obj) => {
                                if (err) {reject(err)}
                                else
                                {
                                    resolve()
                                }
                            })
                        }
                        else // if the position exists, update it's values
                        {
                            collection.updateOne({"positions.symbol" : symbol}, { $set: { "positions.$" : {"symbol" : symbol, "numShares" : numShares, "avgPrice" : avgPrice}}}, (err, obj) => {
                                if (err) {reject(err)}
                                else
                                {
                                    resolve()
                                }
                            })
                        }
                    }
                }
            });
        });
    }

    static async hasBeenCreated()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            let count = await collection.estimatedDocumentCount();
            if (count > 0)
            {
                resolve("Account has already been created")
            }
            else
            {
                reject("ERROR: Account has not yet been created, try running /account/create")
            }
        })
    }

    static async notYetCreated()
    {
        return new Promise(async function (resolve, reject) {
            let collection = await app.getAccountCollection();
            let count = await collection.estimatedDocumentCount();
            if (count > 0)
            {
                reject("ERROR: Account has already been created (Origami currently only supports 1 account)")
            }
            else
            {
                resolve("Account has not yet been created")
            }
        })
    }
}

module.exports = Account;