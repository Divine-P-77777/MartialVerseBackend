const mongoose = require("mongoose")

const Playlist = new mongoose.Schema({
    title: {
        type: String, required: true,trim:true
    },
    description:{
        type:String , required:true , trim :true
    },
    url:{
        type:String,required:true , trim :true
    },
    contentType:{
        type:String, required:true ,trim :true
    },
    uploadBy:{
        type:String, required:true ,trim :true
    },

},    {
        timestamp:true
    }
)

module.exports = mongoose.model("videos",Playlist)