const mongoose = require('mongoose');
const { Schema } = mongoose;

const candidateSchema = new Schema({
    // We link this to the User model to get the candidate's name, ID, etc.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    votes: {
        type: Number,
        default: 0
    }
});

const electionSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Active', 'Completed'],
        default: 'Pending'
    },
    candidates: [candidateSchema],
    voters: [{
        // A list of all users who are eligible to vote
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    voted: [{
        // A list of users who have already cast their vote
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    }
}, { timestamps: true });

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;