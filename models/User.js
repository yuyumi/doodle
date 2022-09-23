const mongoose = require('mongoose');

// Create a Mongoose Schema (format for the timeslot input)
const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    submitted: {
        type: Boolean,
        default: false
    }
})

// Export to a model
module.exports = mongoose.model('User', userSchema);