/** @format */
require("dotenv").config();
// console.log(md5("messafafdge"));
// console.log(process.env);
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// var bodyParser = require("body-parser");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

const port = 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.set("strictQuery", true);

app.use(
    session({
        secret: "our little secret",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// console.log(process.env.SECRET);

mongoose.connect(
    "mongodb://127.0.0.1:27017/userDB",
    {
        useNewUrlParser: true,
        // useCreateIndex: true,
    },
    (err) => {
        if (!err) {
            console.log("MongoDB Connection Succeeded.");
        } else {
            console.log("Error in DB connection: " + err);
        }
    }
);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const secret = process.env.SECRET;
// console.log(secret);

// userSchema.plugin(encrypt, { secret, encryptedFields: ["password"] });
// userSchema.plugin(encrypt, {
//     encryptionKey: encKey,
//     signingKey: sigKey,
//     encryptedFields: ["age"],
// });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => res.render("home"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", (req, res) => {
    // // console.log(req.body);
    // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash,
    //     });
    //     newUser.save((err) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("added user successfully");
    //             res.render("secrets");
    //         }
    //     });
    // });
    User.register(
        {
            username: req.body.username,
        },
        req.body.password,
        (err, User) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        }
    );
});

app.post("/login", (req, res) => {
    // const username = req.body.username;
    // const password = req.body.password;
    // User.findOne({ email: username }, (err, foundUser) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         if (foundUser) {
    //             bcrypt.compare(
    //                 password,
    //                 foundUser.password,
    //                 function (err, result) {
    //                     // result == true
    //                     if (result == true) {
    //                         res.render("secrets");
    //                     }
    //                 }
    //             );
    //         }
    //     }
    // });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
