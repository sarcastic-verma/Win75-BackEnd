const EventWindow = require('../models/event_window');
const HttpError = require('../models/http-error');
const Slot = require('../models/slot');
const Game = require('../models/game');
const mongoose = require('mongoose');

const getEventWindow = async (req, res, next) => {
    const eventWindowId = req.params.eid;
    let eventWindow;
    try {
        eventWindow = await EventWindow.findById(eventWindowId);
    } catch (error) {
        return next(new HttpError(error.message, error.statusCode));
    }
    res.json({eventWindow: eventWindow});
};
const createEventWindow = async (req, res, next) => {
    let today = new Date();
    let date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
    console.log(date.toLocaleDateString());
    let eventWindow = new EventWindow({
        date,
        startTime: "3:00 P.M",
        endTime: "6:00 P.M",
        slots: []
    });
    let eventWindowId;
    try {
        await eventWindow.save(async function (err, window) {
            try {
                console.log(window.id);
                eventWindowId = window.id;
                console.log(eventWindowId + "lol");
                await creatSlots(eventWindowId);
            } catch (error) {
                console.log(error.message);
            }
        });
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }
    await res.json({eventWindow: eventWindow});
};
const createGame = async (slotId) => {
    let slot;
    try {
        slot = await Slot.findById(slotId);
        // console.log(slot);
    } catch (error) {
        console.log(error);
    }
    if (slot != null) {
        let game1, game2, game3, game4;
        let games = [];
        game1 = new Game({
            slotId,
            betValue: 50
        });
        game2 = new Game({
            slotId,
            betValue: 100
        });
        game3 = new Game({
            slotId,
            betValue: 500
        });
        game4 = new Game({
            slotId,
            betValue: 1000
        });
        games.push(game1, game2, game3, game4);
        await slot.games.push(game1, game2, game3, game4);
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            Game.collection.insertMany(games, (err, docs) => {
            });
            await slot.save();
            await sess.commitTransaction();
        } catch (error) {
            console.log(error);
        }
    }
};
const creatSlots = async (eventId) => {
    let eventWindow;
    try {
        console.log(eventId + "wow");
        eventWindow = await EventWindow.findById(eventId);
        console.log(eventWindow);
    } catch (err) {
        console.log(err);
    }
    let slot;
    if (eventWindow != null) {
        let today = new Date();
        console.log(today + "lol");
        let slots = [];
        let startSlotTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0);
        console.log(startSlotTimestamp);
        for (let i = 0; i < 3; i++) {
            slot = new Slot({
                eventWindowId: eventId,
                startTime: startSlotTimestamp,
                endTime: startSlotTimestamp.setHours(startSlotTimestamp.getHours() + 1),
                game: []
            });
            slots.push(slot);
            // console.log(slot.endTime.toLocaleString());
            await eventWindow.slots.push(slot);
        }
        try {
            let slotId;
            const sess = await mongoose.startSession();
            sess.startTransaction();
            Slot.collection.insertMany(slots, async (err, docs) => {
                console.log(docs['insertedIds']['0']);
                for (let i = 0; i < 3; i++) {
                    slotId = docs['insertedIds'][`${i}`];
                    // console.log(slotId + "lol");
                    await createGame(slotId);
                }
            });
            console.log("window saved");
            await eventWindow.save();
            await sess.commitTransaction();
            // await EventWindow.save();
        } catch (error) {
            console.log(error);
        }
    }
};

exports.createEventWindow = createEventWindow;
exports.getEventWindow = getEventWindow;