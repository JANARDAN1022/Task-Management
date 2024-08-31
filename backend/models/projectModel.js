const mongoose = require('mongoose');


const ProjectSchema = new mongoose.Schema({
    ProjectName:{
        type:String,
        required:[true,"Please Provide A Name For The Project"],
    },
    Description:{type:String},
    StartDate:{type:Date},
    EstimatedEndDate:{type:Date},
    Deleted:{type:Boolean,default:false},
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    LastUpdatedBy:{type: mongoose.Schema.Types.ObjectId,ref:'user'},  
    company: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'company', 
        required: true 
    },  
},{timestamps:true});



module.exports = mongoose.model("project",ProjectSchema);