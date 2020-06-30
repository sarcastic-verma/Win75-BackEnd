const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const constants = require('../constants');
const HttpError = require('../models/http-error');
const Game = require('../models/game');
const User = require('../models/user');

const getGameById = async (req, res, next) => {
    const gameId = req.params.sid;
    let game;
    try {
        game = await Game.findById(gameId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a game.',
            500
        );
        return next(error);
    }
    if (!game) {
        const error = new HttpError(
            'Could not find game for the provided id.',
            404
        );
        return next(error);
    }
    // let player_summary;
    // try {
    //     player_summary = await game.populate('PlayerSummary');
    // } catch (err) {
    //     const error = new HttpError(err.message, 500);
    //     return next(error);
    // }
    await res.json({
        game: game.toObject({getters: true}),
        // player_summary:player_summary
    });
};

const getGamesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithGames;
    try {
        userWithGames = await User.findById(userId).populate('games');
    } catch (err) {
        const error = new HttpError(
            'Fetching games failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!userWithGames) {
        return next(
            new HttpError('Could not find provided user id.', 404)
        );
    }
// let player_summary;
    // try {
    //     player_summary = await game.populate('PlayerSummary');
    // } catch (err) {
    //     const error = new HttpError(err.message, 500);
    //     return next(error);
    // }
    await res.json({
        games: userWithGames.games.map(game =>
            game.toObject({getters: true})
        )
    });
};

const startGame = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const loggedInUserId = req.userData.userId;
    const {} = req.body;
    const createdGame = new Game({});

    let user;
    try {
        user = await User.findById(loggedInUserId);
    } catch (err) {
        const error = new HttpError(
            err.message + "okdlks",
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdGame.save();
        user.games.push(createdGame);
        await user.save();
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            err.message + "lol",
            500
        );
        return next(error);
    }

    res.status(201).json({story: createdGame});
};

function calcResult(spadesTotalInvestment, clubTotalInvestment, diamondTotalInvestment, heartTotalInvestment, gameInvestment, playerCount) {
    let businessProfit, droppedOptions, totalProfit, distributableProfit, distributableProfitPercent;
    //////////Case all equal/////////////
    if (spadesTotalInvestment === heartTotalInvestment === diamondTotalInvestment === clubTotalInvestment || playerCount <= 2) {
        businessProfit = 0;
        droppedOptions = [constants.spade, constants.heart, constants.diamond, constants.club];
        totalProfit = 0;
        distributableProfit = 0;
        distributableProfitPercent = 0;
        return {businessProfit, droppedOptions, totalProfit, distributableProfit, distributableProfitPercent};
    }
    /////////////////Case 3 equal///////////////
    else if (heartTotalInvestment < spadesTotalInvestment) {

        return {businessProfit, droppedOptions, totalProfit, distributableProfit, distributableProfitPercent};
    }
    ////////////////Case 2 equal////////////////
    else if (heartTotalInvestment > spadesTotalInvestment) {
        return {businessProfit, droppedOptions, totalProfit, distributableProfit, distributableProfitPercent};
    }
    ////////////////case 1 max//////////////////
    else if (
        spadesTotalInvestment >= heartTotalInvestment
    ) {
        return {businessProfit, droppedOptions, totalProfit, distributableProfit, distributableProfitPercent};
    }
}

const endGame = async (req, res, next) => {
    const gameId = req.params.gid;
    const userId = req.userData.userId;
    let user;
    user = await User.findById(userId);
    let game;
    try {
        game = await Game.findById(gameId);
    } catch (err) {
        const error = new HttpError(err.message, err.statusCode);
        return next(error);
    }
    const {
        playerCount, spadesTotalInvestment, clubTotalInvestment, diamondTotalInvestment, heartTotalInvestment, playerSummary, optionSummary, gameInvestment,
    } = req.body;

    const {businessProfit, droppedOptions, totalProfit, distributableProfit, distributableProfitPercent} = calcResult(spadesTotalInvestment, clubTotalInvestment, diamondTotalInvestment, heartTotalInvestment, gameInvestment, playerCount);
    game.heartTotalInvestment = heartTotalInvestment;
    game.spadesTotalInvestment = spadesTotalInvestment;
    game.clubTotalInvestment = clubTotalInvestment;
    game.diamondTotalInvestment = diamondTotalInvestment;
    game.playerCount = playerCount;
    game.gameInvestment = gameInvestment;
    /////////////////////////////
    game.businessProfit = businessProfit;
    game.distributableProfit = distributableProfit;
    game.distributableProfitPercent = distributableProfitPercent;
    game.totalProfit = totalProfit;
    game.droppedOptions = droppedOptions;
    ///////////////////////////////////
    game.optionSummary = optionSummary;
    game.playerSummary = playerSummary;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await game.save();
        user.games.push(game);
        await user.save();
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            err.message + "lol",
            500
        );
        return next(error);
    }

};
// Total_Distributable_Profit:750,
//     business_profit: 625
// members_profit: 125
// Distributable_Profit_percent:83.33%
//
// user_wise_summary:
// [
//     {"User":"U1", opted_options:[A,B,C,D], Accepted_options:[D], Total_investment:200, Profitable_investment:50, proportioned_gain:41.66, Net_Credit:91.66},
//     {"User":"U2", opted_options:[D], Accepted_options:[D], Profitable_investment:50, proportioned_gain:41.66},
//     {"User":"U3", opted_options:[A], Accepted_options:[], Profitable_investment:0, proportioned_gain:0},
//     {"User":"U4", opted_options:[C], Accepted_options:[], Profitable_investment:0, proportioned_gain:0}
// ],
//
//     option_wise_summary:
// [
//     {"Option":"A", users:[U1, U3, U5, U10, U14], total:250},
//     {"Option":"B", users:[U1, U7, U9, U11, U15], total:250},
//     {"Option":"C", users:[U1, U4, U6, U8, U13], total:250},
//     {"Option":"D", users:[U1, U2, U12], total:150}
// ],

exports.getGameById = getGameById;
exports.getGamesByUserId = getGamesByUserId;
exports.startGame = startGame;
exports.endGame = endGame;


