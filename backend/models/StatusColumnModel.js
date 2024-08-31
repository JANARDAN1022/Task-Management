const mongoose = require('mongoose');


const StatusColumn = new mongoose.Schema({
    StatusName:{
        type:String,
        required:[true,"Please Provide A Name For The Project"],
    },
    Description:{type:String},
    Deleted:{type:Boolean,default:false},
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    LastUpdatedBy:{type: mongoose.Schema.Types.ObjectId,ref:'user'}, 
    ProjectId:{ type: mongoose.Schema.Types.ObjectId, ref: 'project'}   
},{timestamps:true});



module.exports = mongoose.model("StatusColumn",StatusColumn);