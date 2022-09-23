const mongoose = require('mongoose');

// Create a Mongoose Schema (format for the timeslot input)
const timeslotSchema = new mongoose.Schema({
    timeslot: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: false
    },
    user: {
        type: String,
        required: true
    }
})

// Export to a model
module.exports = mongoose.model('TimeSlot', timeslotSchema);