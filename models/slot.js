const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
        eventWindowId: {
        type: mongoose.Types.ObjectId,
        ref: 'EventWindow',
            // required: true
    },
    startTime: {type: Date,
        // required: true
    },
    endTime: {
        type: Date,
        // required: true
    },
    games: [{
        type: {type: mongoose.Types.ObjectId, ref: 'Game'},
        // required: true,
    }],
});
module.exports = new mongoose.model("Slot", slotSchema);
