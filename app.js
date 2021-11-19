//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();
//console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

//place session just above mongoDB !important and below app.use
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB'); //localserver


const userSchema = new mongoose.Schema ({
  email:String,
  password:String
});

//here add your passport local mongoose
//User.plugin(passportLocalMongoose); //replace user with your own schema
userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User", userSchema);

//here add the passport local mongoose for serialising and deserialising
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.get("/", function(req, res) {
  res.render("home")
});//get home

app.get("/login", function(req, res) {
  res.render("login")
});//get login

app.post("/login", function(req, res) {

// create a User object using the items entered from the form
  const oldUser = new User ({
     username: req.body.username,
     password:req.body.password
   }); //old user

//use passport to login the user and authenticate the user
      req.login(oldUser, function(err) {
      if (err) {
        console.log(err);
        res.send("Not Authenticated")
      } else {
        passport.authenticate("local")(req,res, function(){
          res.redirect("/secrets");
      });
      }
      });

    });//post login


app.get("/register", function(req, res) {
res.render("register")
});//get register

app.get("/secrets", function(req, res) {
//check if user is authenticated first before rendering
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});//get secrets

app.post("/register", function(req, res) {
  User.register({username:req.body.username}, req.body.password, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets")
      })
    }

});

});//post register


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});//get logout


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
