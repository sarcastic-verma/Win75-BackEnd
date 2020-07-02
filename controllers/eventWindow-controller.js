const EventWindow = require('../models/event_window');
const HttpError = require('../models/http-error');
const Slot = require('../');
const moment = require('moment');

const createEventWindow = async (req, res, next) => {

    const date = Date();
    let eventWindow = new EventWindow({
        date,
        startTime: "3:00 P.M",
        endTime: "6:00 P.M",
        slots: []
    });
    let eventWindowId;
    try {
        await eventWindow.save(function (err, window) {
            eventWindowId = window.id;

        });
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }
    await creatSlots(eventWindowId);
    res.json({eventWindow: eventWindow});
};

async function creatSlots(eventId) {

    // let eventWindow = await EventWindow.findById(eventId);
    let slot;
    let slots = [];
    // let startTime = 300;
    // let endTime = "3:03";
    // console.log(moment().add(3, 'minutes').hour(15));
    var date = new Date(2020, 6, 1, 15, 0);
    console.log(date);
    date.setMinutes(date.getMinutes() + 3);
    console.log(date.toLocaleString());
    // for (let i = 0; i < 60; i += 3) {
    //     slot = new Slot({
    //         eventWindowId: eventId,
    //         startTime,
    //         endTime,
    //         game: []
    //     });
    //     startTime =
    //     slots.push(slot);
    // }
    // Slot.insertMany(slots, function () {
    // });
}

exports.createEventWindow = createEventWindow;
