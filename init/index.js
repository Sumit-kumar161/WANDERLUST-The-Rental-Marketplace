const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const path = require('path');  // Import the path module
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const dbUrl = process.env.ATLASDB_URL;
main().then(()=> console.log("connected to DB"))
.catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
}


const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner : "6693d80641ff8c909314e948"}));

    initData.data = initData.data.map((obj) => ({...obj, geometry: {type: 'Point', coordinates: [77.2088,28.6139]}}));

    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();

