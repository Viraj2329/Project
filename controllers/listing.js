const Listing = require("../models/listing");

//index route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

//new route
module.exports.renderNewFrom = (req, res) => {
    res.render("listings/new.ejs");
};

//create route
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; //passport method :- to add new listing to fetch username
    newListing.image = {filename, url};
    console.dir(newListing.image);
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

//show route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing is Not Exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

//edit route
module.exports.renderEditFrom = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Does Not Exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}

// update route
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect("/listings");

};

//delete route
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};