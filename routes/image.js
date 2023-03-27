const express = require('express');
const { default: mongoose } = require('mongoose');
mongoose.set('strictQuery', false)
const plm = require('passport-local-mongoose')


const imageSchema = mongoose.Schema({
  title:String,
  username:String,
  fileid: String,
  userid: {
    type: mongoose.Types.ObjectId,
    ref:'user'
  },
    desc: String,  
    link: {
        type: String,
        default:""
  },
  comments: {
    type: Array,
    default: [],
  },
 

})


imageSchema.plugin(plm);
module.exports = mongoose.model('image', imageSchema)