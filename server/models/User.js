const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    collegeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Student', 'SectionAdmin', 'SuperAdmin'],
        default: 'Student'
    },
    department: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        trim: true
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

module.exports = User;