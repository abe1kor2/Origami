const express = require('express');
const router = require("./routes/routes")
const mongo = require('./utils/db');
const port = "3000";

// This method runs once and connects to the mongoDB
var db;
async function loadDBClient() {
	try {
		db = await mongo.connectToDB();
	}catch(err){
		throw new Error('Could not connect to the Mongo DB');
	}
};  
loadDBClient();

const app = express()
app.use(express.json())
app.use("/", router)
app.use(express.static(__dirname + '/views'))

server = app.listen(port, () => {
	console.log('Origami app listening at http://localhost:%d', port);
});
  
process.on('SIGINT', () => {
	console.info('SIGINT signal received.');
	console.log('Closing Mongo Client.');
	mongo.closeDBConnection();
	server.close(() => {
	  console.log('Http server closed.');
	});
 });

async function getAccountCollection(){
    try{
		return await db.collection('account');
	}catch(err){
		throw err;
	}    
};

module.exports.getAccountCollection = getAccountCollection;
