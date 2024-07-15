const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new schema({
    title:{
        type: String,
        required: true,
    },
    description: String,
    image: {
        url:{
            type: String,
            default:"https://images.pexels.com/photos/534164/pexels-photo-534164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        },
        filename:{
            type:String,
        },
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },
    geometry:  {
          type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
        }
     
});


listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});


const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;


