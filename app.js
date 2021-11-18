//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');



const app = express();
//console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect('mongodb://localhost:27017/userDB'); //localserver


const userSchema = new mongoose.Schema ({
  email:String,
  password:String
});
//add these next two lines before creating Models
//HIDDEN SECRET LINE SENT TO .ENV
const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"]});


const User = mongoose.model("User", userSchema);



app.get("/", function(req, res) {
  res.render("home")
});//get home

app.get("/login", function(req, res) {
  res.render("login")
});//get login

app.post("/login", function(req, res) {
  //at this point, search and confirm user exists then allow.
  const username = req.body.username;
  const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
      if (err){
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets")
          } else {
            res.send("Incorrect password. Try again")
          }
        } else {
          res.send("User does not exist. Please register")
        }
      }

    });

    });//post login


app.get("/register", function(req, res) {
  res.render("register")
});//get register

app.post("/register", function(req, res) {
  //at this point, add user to database
  const newUser = new User ({
     email:req.body.username,
     password: req.body.password
   }); //new user

    newUser.save(function(err){
     if (!err) {
       res.render("secrets")
     } else {
       console.log(err);
     }
  })//save user
});//post register



app.listen(3000, function() {
  console.log("Server started on port 3000");
});