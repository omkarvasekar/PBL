const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://0.0.0.0:27017/ProjectDB");
const User = new mongoose.Schema({
    username: String,
    password: String,
  });

  // Setting up the passport plugin
  User.plugin(passportLocalMongoose);

  const admin= new mongoose.Schema({
    username: String,
    password: String,
  });
  
  // Setting up the passport plugin
admin.plugin(passportLocalMongoose);
  
  
  module.exports = mongoose.model('User', User);
