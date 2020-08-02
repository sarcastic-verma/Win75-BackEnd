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
    await res.json({eventWindow: eventWindow});
};
const getCurrentEventWindow = async (req, res, next) => {
    let currentEventWindow;
    try {

        // currentEventWindow = await EventWindow.find({
        //     "date": {
        //         "$gte": new Date(new Date(2020, 8, 1).setHours(0, 0, 0)),
        //         "$lt": new Date(new Date(2020, 8, 3).setHours(23, 59, 59))
        //     }
        // }).sort({date: 'asc'});
        currentEventWindow = await EventWindow.find({
            "date": {
                "$gte": new Date(new Date().setHours(0)),
                "$lt": new Date(new Date().setHours(18))
            }
        });
    } catch (err) {
        return next(new HttpError(err.message + "lpop", err.statusCode));
    }
    let games = {
        "0": [], "1": [], "2": []
    };
    console.log(currentEventWindow);
    if (currentEventWindow.length === 0) {
        return next(new HttpError("Event window not found" + "nf", 404));
    }
    for (const slot in currentEventWindow[0].slots) {
        let foundSlots;
        try {
            foundSlots = await Slot.findById(currentEventWindow[0].slots[slot]);
            console.log("start");
            console.log(foundSlots.startTime.toLocaleString());
            console.log(foundSlots.endTime.toLocaleString());

            for (let i = 0; i < 4; i++) {
                games[`${slot}`].push(foundSlots.games[i]._id);
            }
        } catch (err) {
            next(new HttpError(err.message + "lol", err.statusCode));
            console.log("d");

        }
    }
    await res.json({games: games});
};
const createEventWindow = async (req, res, next) => {
    let today = new Date();
    let date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 1, 0);
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
        let startSlotTimestamp = [new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0)];

        let endSlotTimestamp = [new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0), new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0)];
        for (let i = 0; i < 3; i++) {
            slot = new Slot({
                eventWindowId: eventId,
                startTime: startSlotTimestamp[i],
                endTime: endSlotTimestamp[i],
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
exports.getCurrentEventWindow = getCurrentEventWindow;
exports.getEventWindow = getEventWindow;