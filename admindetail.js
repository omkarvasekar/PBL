const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://vasekar_omkar:ZU69mvR9mLP2BZrH@cluster0.sybnjnv.mongodb.net/ProjectDB");



  const admin= new mongoose.Schema({
    username: String,
    password: String,
  });
  
  // Setting up the passport plugin
admin.plugin(passportLocalMongoose);
  
  
  module.exports = mongoose.model('admin', admin);