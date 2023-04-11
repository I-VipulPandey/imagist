const express = require('express');
const { default: mongoose } = require('mongoose');
mongoose.set('strictQuery', false)
const plm = require('passport-local-mongoose')


const boardSchema = mongoose.Schema({
    username:String,
    name:String,
  userid: {
    type: mongoose.Types.ObjectId,
    ref:'user'
    },
    files: {
        type: Array,
        default:[]
  },
  images: {
    type: Array,
    default:[]
}
    

})


boardSchema.plugin(plm);
module.exports = mongoose.model('board', boardSchema)