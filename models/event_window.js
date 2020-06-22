const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const eventWindowSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true, unique: true
    },
    startTime: {type: String, required: true},
    endTime: {
        type: String,
        required: true
    },
    slots: [{
        type: {type: mongoose.Types.ObjectId, ref: 'Slot'},
        required: true,
    }],
});
eventWindowSchema.plugin(uniqueValidator);
module.exports = new mongoose.model("EventWindow", eventWindowSchema);
