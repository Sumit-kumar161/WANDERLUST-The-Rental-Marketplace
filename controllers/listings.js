const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });


module.exports.index = async (req,res)=>{
    const allListings = await  Listing.find({ });
    res.render("listings/index.ejs", {allListings});
  }

module.exports.renderNewForm = (req,res)=>{
    res.render("./listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
   const listing = await Listing.findById(id).populate({
      path: "reviews", 
      populate: {
      path: "author",
   }}).populate("owner");
   if(!listing){
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
   }
   res.render("./listings/show.ejs", {listing});
}

module.exports.createListing = async (req,res,next)=>{
 let response = await   geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New listing created !");
    res.redirect("/listings");
}

module.exports.editListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
   }
   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/c_scale,h_300,w_250");
    res.render("./listings/edit.ejs", {listing , originalImageUrl});
}

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let response = await   geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()
    let listing= await Listing.findByIdAndUpdate(id, {...req.body.listing});
    listing.geometry = response.body.features[0].geometry;
    listing.save();

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
}

module.exports.search = async(req,res)=>{
 let query = req.body.search;
  query = query.trim();
 const listings = await Listing.find({$or: [{country:new RegExp(query, 'i')},  {location:new RegExp(query, 'i')} ]});

 if(query == "" || query == " " || query == "  "){
  req.flash("error", "Please enter a valid location");
  res.redirect("/listings");
 } else if(listings.length == 0){
  req.flash("error","No such listings !");
  res.redirect("/listings");
 } else{
  res.render("./listings/search.ejs", {listings,query});
 }

}

