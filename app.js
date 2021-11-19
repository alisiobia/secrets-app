//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption'); //now elevating to hash md-5 instead of encryption
//const md5 = require('md5'); // for simple hashing
const bcrypt = require("bcrypt"); // for even better security
const saltRounds = 10; // bcrypt salt round numbers for security



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
/* Only add these if lazy you want to use encryption instead of hashing as your security
//add these next two lines before creating Models
//HIDDEN SECRET LINE SENT TO .ENV
const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"]});
*/
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
  //const password = md5(req.body.password);//for hashing. normal leave as just req



    User.findOne({email: username}, function(err, foundUser){
      if (err){
        console.log(err);
      } else {
        if (foundUser) {
          // Load hash from your password DB.
                bcrypt.compare(password, foundUser.password, function(err, result) {
                   // result == true
                   if (result === true) {
                     res.render("secrets")
                   } else {
                     res.send("Incorrect password. Try again")
                   }
                });
        } else {
            res.send("User does not exist. Please register")
        }
      };//if no error
    });//find login
    });//post login


app.get("/register", function(req, res) {
  res.render("register")
});//get register

app.post("/register", function(req, res) {
//add bycrypt hash for good security
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      //at this point, add user to database
      const newUser = new User ({
         email:req.body.username,
         //password: req.body.password, - normal or encryption security
         //password: md5(req.body.password) // hashing security
         password: hash // for hash encryption

       }); //new user

        newUser.save(function(err){
         if (!err) {
           res.render("secrets")
         } else {
           console.log(err);
         }
      })//save user
  });





});//post register



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
