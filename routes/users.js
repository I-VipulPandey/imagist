const mongoose = require('mongoose');
const passport = require('passport');
var express = require('express');
var router = express.Router();
var plm = require('passport-local-mongoose');


mongoose.connect(process.env['MONGO_URI']).then(function () {
  console.log('connected to mongo')
})

var userSchema = mongoose.Schema({
  name: String,
  email:String,
  username: {
    type:String,
  },
  password:String,
  dp: {
    type: String,
    default:""
  },

  files: {
    type: Array,
    default:[]
    
  },
  images: [{
    type: mongoose.Types.ObjectId,
    ref: 'image'
  }],
  saved: {
    type: Array,
    default:[]
  },
  boards:[{
    type: mongoose.Types.ObjectId,
    ref: 'board'
  }],
  
 
})


userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema);