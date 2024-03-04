if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./untility/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/userRoute.js");



app.set("view engine", "ejs");
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
    await mongoose.connect(MONGO_URL);
}
main().then(() =>{ console.log("connect to DB")})
.catch((err) => { console.log(err)});





const sessionOptions ={
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Flash middleware
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curntUser = req.user;
    next();
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User({
//         email : "delta@gmail.com",
//         username : "delta",
//     })
//     let registerUser = await user.register(fakeUser, "hello");
//     res.send(registerUser);
// })

//All wrong route error
app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page Not Found!"))
})


//Middleware Using ExpressError file
app.use((err,req,res,next) => {
    let {statusCode = 500, message = "Something Went Wrong!"} = err;
    res.status(statusCode).render( "error.ejs", {message});
});

app.listen(8080,() => {
    console.log("listening to port : 8080");
});