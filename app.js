require("dotenv").config();
//console.log("Cloudinary Config:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY,);
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const fs = require("fs");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const galleryRoutes = require("./routes/gallery_CRUD"); //ge;;ary
const eventRoutes = require("./routes/eventReport_CRUD");//event
const methodOverride = require("method-override");
//full path to counter file
const counterFilePath = path.join(__dirname, "counter.json");

// Models
const Admin = require("./models/admin");
const Cadet = require("./models/cadet");

// ✅ Initialize Express
const app = express();

// ✅ Import Routers
const Cadet_listing = require("./routes/cadet_CRUD");
const studyDocsRouter = require("./routes/studyDocs_CRUD"); // ✅ Study Docs Router

// ✅ Connect to MongoDB
const dburl = process.env.DB; //mongo db atlas url
async function main() {
    try {
        await mongoose.connect(dburl);
        console.log("✅ Connected to DB");
    } catch (err) {
        console.error("❌ Error connecting to DB:", err);
        process.exit(1);
    }
}
main();

// ✅ Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Middleware

app.use(methodOverride("_method"));////
app.use(bodyParser.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Express Session
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
}));

// ✅ Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// ✅ Flash Messages
app.use(flash());

// ✅ Store user in locals
app.use((req, res, next) => {
    res.locals.currUser = req.user || null;
    next();
});

// ✅ Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', './layouts/boilerplate');

// ✅ Routes
app.use("/admin", Cadet_listing); //cadet listing router
app.use("/studyDocs", studyDocsRouter); //  Added Study Docs Router
app.use("/gallery", galleryRoutes); //gallery router
app.use("/event", eventRoutes); //event router



// ✅ Home Route
app.get("/", (req, res) => {
    /*
    if (!req.isAuthenticated()) {
        req.flash("message", "Please log in to view this page");
        return res.redirect("/login");
    }
    */

    // Counter logic
    fs.readFile(counterFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading counter file:", err);
            return res.render("pages/home", { visitorCount: "N/A", admin: req.user, message: req.flash("message") });
        }

        let countData = JSON.parse(data);
        countData.count += 1;  // Increment count

        // After successfully writing file, render page inside callback
        fs.writeFile(counterFilePath, JSON.stringify(countData), (err) => {
            if (err) {
                console.error("Error writing counter file:", err);
                return res.render("pages/home", { visitorCount: "N/A", admin: req.user, message: req.flash("message") });
            }

            // Render page after file is written successfully
            res.render("pages/home", { visitorCount: countData.count, admin: req.user, message: req.flash("message") });
        });
    });
});


// ✅ Signup Routes
app.get("/signup", (req, res) => {
    res.render("pages/signup", { message: req.flash("message") });
});
app.post("/signup", async (req, res) => {
    const { name, email, password, accessKey } = req.body;

    // Access key from environment variables
    const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY;

    if (accessKey !== ADMIN_ACCESS_KEY) {
        req.flash("message", "Invalid access key. Signup not allowed.");
        return res.redirect("/signup");
    }

    try {
        const admin = new Admin({ name, email, password });
        await admin.save();
        req.flash("message", "Signup successful!");
        res.redirect("/");
    } catch (error) {
        if (error.code === 11000) {
            req.flash("message", "Email already exists");
            return res.redirect("/signup");
        }
        req.flash("message", "An error occurred");
        res.redirect("/signup");
    }
});

// ✅ Login Routes
app.get("/login", (req, res) => {
    res.render("pages/login", { message: req.flash("message") });
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
}));

// ✅ Logout Route
app.get("/logout", (req, res) => {
    req.logout(() => {
        req.flash("message", "You have logged out");
        res.redirect("/");
    });
});

// ✅ Cadet Listing Route
app.get("/cadetListing", async (req, res) => {
    
    /*if (!req.isAuthenticated()) {
        req.flash("message", "Please log in to view this page");
        return res.redirect("/login");
    }
     */
    const cadet = await Cadet.find({});
    res.render("pages/cadetListing", { cadet, currUser: req.user });  
});

// ✅ ADMIN page
app.get("/admin", (req, res) => {
    res.render("pages/dashboard");
});
// terms and conditions
app.get('/terms', (req, res) => {
  res.render('pages/terms');
});

// ✅ Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
