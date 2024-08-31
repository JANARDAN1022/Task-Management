const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invitedUsers: [
        {
          code: String,
          userEmail: String,
          expires: Date,
        }
      ],

});

module.exports = mongoose.model('Company', companySchema);
