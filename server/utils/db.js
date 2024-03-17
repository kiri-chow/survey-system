const fs = require("node:fs");
const { MongoClient, ObjectId } = require('mongodb');

// read dbUri from external file
let dbUri;
try {
    dbUri = fs.readFileSync('dbUri.txt', 'utf8');
} catch (err) {
    console.error(err);
}

if (!dbUri) {
    dbUri = 'mongodb://localhost:27017';
}

// set dbUri
if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = dbUri;
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('bookingsDB');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };
