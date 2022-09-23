// Import express, dotenv, and mongoose packages
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Create an application using Express
const app = express();

// Import the timeslot mongoose model
const TimeSlot = require("./models/TimeSlot");

// Import the user mongoose model
const User = require("./models/User");

// Hardcode a list of timeslots
const eventSlots = ["Monday 10:00-10:15", 
                    "Monday 10:15-10:30",
                    "Monday 10:30-10:45",
                    "Monday 10:45-11:00",
                    "Wednesday 10:15-10:30",
                    "Wednesday 10:15-10:30",
                    "Wednesday 10:30-10:45",
                    "Wednesday 10:45-11:00"]

// Read the .env file
dotenv.config();

// Allow access to the stylesheet
app.use("/static", express.static("public"));

// Allows us to extract data from the html form
app.use(express.urlencoded({ extended: true }));


// Connect to the MongoDB using Mongoose and the DB_CONNECT environment variable from the .env file
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, err => {
    if(err) throw err;

    // Print a statement in the console if no errors thrown
    console.log("Connected to db!");

    // Host the application on the 3120 port of localhost or port defined by .env and listen to it
    app.listen(process.env.PORT || 3120, () => console.log("Server Up and running"));
});

// View engine configuration
app.set("view engine", "ejs");

// GET METHOD FOR LOGIN

// Activates when the page is on the index page
app.get("/", (req, res) => {

    // Render the user login page
    res.render("login.ejs");
});

//POST METHOD FOR LOGIN

// Activates when the page is on the index page, async means the function will wait for certain functions to complete before finishing
// `req` is the request
app.post('/',async (req, res) => {

    // See if user is in database
    const check = await User.find({ user: req.body.content });

    // If user not in database, create a new user and set of timeslots for the user
    if (check.length == 0) {
        
        // Make a new list of timeslots in MongoDB
        for (let i = 0; i < eventSlots.length; i++) {

            // Mark each timeslot as part of the users' timeslot
            let userTimeslot = new TimeSlot({
                timeslot: eventSlots[i],
                user: req.body.content
            });

            // Save the model onto MongoDB
            try {
                await userTimeslot.save();
            } catch (err) {
                res.redirect("/");
            }
        }

        const user = new User({
            user: req.body.content
        });

        // Save the model onto MongoDB
        try {
            await user.save();

            // Go to the user timeslot page
            res.redirect("/user/" + req.body.content);
        } catch (err) {
            res.redirect("/");
        }
    } else {

        // Go to the user timeslot page if user already exists
        res.redirect("/user/" + req.body.content);
    }
});

// GET METHOD FOR TIMESLOT PAGE

// Activate the following methods if the app is routed to "/<user name>"
app.route("/user/:name")

    // Use a get method to rerender the page into the timeslot selection mode, and use the name of the request as the username for the timeslots
    .get(async (req, res) => {
        const name = req.params.name;

        // Find the user in MongoDB
        const userData = await User.findOne({ user: name });

        // Finds all the to-do tasks and passes it as the list variable for rendering the edit mode
        TimeSlot.find({ user: name }, (err, slots) => {
            res.render("calendar.ejs", { timeSlots: slots, userData: userData });
        });
    })

// MARK AVAILABLE

// Activate the following get method if the app is routed to "/available/<username>/<timeslot id>"
app.route("/available/:name/:id").get((req, res) => {
    const id = req.params.id;
    const name = req.params.name;

    // Find the timeslot in MongoDB's collections by the timeslot id and mark the timeslot as available
    TimeSlot.findByIdAndUpdate(id, { available: true }, err => {
        if (err) return res.send(500, err);

        // Return to calendar page
        res.redirect("/user/" + name);
    });
});

// MARK UNAVAILABLE

// Activate the following get method if the app is routed to "/unavailable/<username>/<timeslot id>"
app.route("/unavailable/:name/:id").get((req, res) => {
    const id = req.params.id;
    const name = req.params.name;

    // Find the timeslot in MongoDB's collections by the timeslot id and mark the timeslot as unavailable
    TimeSlot.findByIdAndUpdate(id, { available: false }, err => {
        if (err) return res.send(500, err);

        // Return to calendar page
        res.redirect("/user/" + name);
    });
});

// SUBMIT FUNCTIONALITY

// Activate the following get method if the app is routed to "/submit/<username>"
app.route("/submit/:name").get((req, res) => {

        // Get the username from the request parameters
        const name = req.params.name;

        // Find the user in the MongoDB
        User.findOneAndUpdate({ user: name }, { submitted: true }, err => {
            if (err) return res.send(500, err);

            // Return to user calendar page
            res.redirect("/user/" + name);
        });
    });