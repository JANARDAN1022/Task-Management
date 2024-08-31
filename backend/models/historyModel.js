const mongoose = require('mongoose');


const HistorySchema = new mongoose.Schema({
    eventName: {
        type: String,
    },
    eventItemType: {
        type: String,
        enum: ['ticket','Teams', 'StatusColumn', 'project', 'user'],
        required: true,
    },
    eventItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'eventItemType',
    },
    action: {
        type: String,
        required: true,
    },
    updatedField:{type:String},
    changes:{
       oldValue:{type:Object},
       newValue:{type:Object},
    },
    performedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'user'},
},{timestamps:true});



module.exports = mongoose.model("history",HistorySchema);