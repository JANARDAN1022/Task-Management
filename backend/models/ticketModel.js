const mongoose = require('mongoose');


const TicketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type:{type:String,required:true},
    ProjectName:{ type: mongoose.Schema.Types.ObjectId, ref: 'project' },
    ProjectId:{ type: mongoose.Schema.Types.ObjectId, ref: 'project' },
    description: { type: String },
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusColumn' },
    labels: [{ type: String }],
    attachments: [{ type: String }], 
    assignedby:{ type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'user', },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ticket',},
    children:[{ type: mongoose.Schema.Types.ObjectId, ref: 'ticket', }],
    ticketName:{
        type:String,
        unique:true
    },
    ticketNumber:{
        type:Number,
    },
    estimatedTime:{type:String},
    loggedTime:{type:String},
    deleted:{type:Boolean,default:false}
}, { timestamps: true });




module.exports = mongoose.model("ticket",TicketSchema);