const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    startTime: {type: String, required: true},
    endTime: {
        type: String,
        required: true
    },
    games: [{
        type: {type: mongoose.Types.ObjectId, ref: 'Game'},
        required: true,
    }],
});
module.exports = new mongoose.model("Slot", slotSchema);
