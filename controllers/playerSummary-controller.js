const HttpError = require('../models/http-error');
const User = require('../models/user');
const mongoose = require('mongoose');
const Game = require('../models/game');
const constants = require('../constants');
const PlayerSummary = require('../models/player_summary');

// async function updateOptionSummary (gameId) {
//
//     let game;
//     try {
//         game = await Game.findById(gameId);
//     } catch (err) {
//         return next(new HttpError("Error fetching game please try again later!!", 404));
//     }
//     if (game) {
//         console.log(game);
//         let playerSummary;
//         const {totalInvestment, optedOptions} = req.body;
//         playerSummary = await PlayerSummary({
//             totalInvestment, optedOptions, gameId, playerId: userId
//         });
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             game.playerSummary.push(playerSummary);
//             game.playerCount = game.playerCount +1;
//             game.gameInvestment += totalInvestment;
//             optedOptions.forEach((element) => {
//                 if (element === constants.spade) {
//                     game.spadesTotalInvestment += game.betValue;
//                 }
//                 else if (element === constants.club) {
//                     game.clubTotalInvestment += game.betValue;
//                 }
//                 else if (element === constants.heart) {
//                     game.heartTotalInvestment += game.betValue;
//                 }
//                 else {
//                     game.diamondTotalInvestment += game.betValue;
//                 }
//             });
//             await game.save();
//             await playerSummary.save();
//             await sess.commitTransaction();
//         } catch (err) {
//             return next(new HttpError(err.message, 404));
//         }
//         await res.json({
//             message: "player created",playerSummary:playerSummary
//         });
//     } else {
//         await res.json({
//             message: "game dosen't exist"
//         });
//     }
// }
const getPlayerSummary = async (req, res, next) => {
    const summaryId = req.params.summaryId;
    let foundPlayerSummary;
    try {
        foundPlayerSummary = await PlayerSummary.findById(summaryId);
    } catch (err) {
        return next(new HttpError("Error fetching summary please try again later!!", 404));
    }
    if (!foundPlayerSummary) {
        await res.json({
            message: "No summary for this Id."
        });
    }
    await res.json({foundPlayerSummary: foundPlayerSummary});
};
const makePlayerSummary = async (req, res, next) => {
    const gameId = req.params.gid;
    const userId = req.userData.userId;
    let game, user;
    try {
        user = await User.findById(userId);
        game = await Game.findById(gameId);
    } catch (err) {
        return next(new HttpError("Error fetching game please try again later!!", 404));
    }
    if (game) {
        // console.log(game);
        let playerSummary;
        const {optedOptions} = req.body;
        const totalInvestment = optedOptions.length * game.betValue;
        if (totalInvestment > user.inWalletCash) {
            return next(new HttpError("Paise ni h iss user pr", 501));
        }
        playerSummary = await PlayerSummary({
            totalInvestment, optedOptions, gameId, playerId: userId
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await playerSummary.save();
            await game.playerSummary.push(playerSummary);
            user.inWalletCash -= playerSummary.totalInvestment;
            user.totalAmountSpent += playerSummary.totalInvestment;
            game.playerCount = game.playerCount + 1;
            game.gameInvestment += totalInvestment;
            optedOptions.forEach((element) => {
                if (element === constants.spade) {
                    game.spadesTotalInvestment += game.betValue;
                } else if (element === constants.club) {
                    game.clubTotalInvestment += game.betValue;
                } else if (element === constants.heart) {
                    game.heartTotalInvestment += game.betValue;
                } else {
                    game.diamondTotalInvestment += game.betValue;
                }
            });
            await game.save();
            await user.save();
            await sess.commitTransaction();
        } catch (err) {
            return next(new HttpError(err.message, 404));
        }
        await res.json({
            message: "player created", playerSummary: playerSummary
        });
    } else {
        await res.json({
            message: "game dosen't exist"
        });
    }
};
const updatePlayerSummary = async (req, res, next) => {
    const gameId = req.params.gid;
    // const userId = req.userData.userId;
    let game;
    try {
        game = await Game.findById(gameId);
    } catch (err) {
        return next(new HttpError("Error fetching game please try again later!!", 404));
    }
    for (const summary of game.playerSummary) {
        let foundPlayerSummary;
        try {
            foundPlayerSummary = await PlayerSummary.findById(summary).populate('playerId');
        } catch (err) {
            next(new HttpError(err.message, err.statusCode));
        }
        foundPlayerSummary.acceptedOptions = foundPlayerSummary.optedOptions;
        console.log(foundPlayerSummary.optedOptions);
        foundPlayerSummary.optedOptions.forEach((element) => {
            console.log(game.droppedOptions.includes(element));
            if (game.droppedOptions.includes(element)) {
                console.log(element);
                foundPlayerSummary.acceptedOptions.splice(foundPlayerSummary.acceptedOptions.indexOf(element), 1);
            }
        });
        console.log(foundPlayerSummary.acceptedOptions);
        foundPlayerSummary.profitableInvestment = foundPlayerSummary.acceptedOptions.length * game.betValue;
        foundPlayerSummary.proportionalGain = foundPlayerSummary.profitableInvestment * game.distributableProfitPercent / 100;
        foundPlayerSummary.totalGain = foundPlayerSummary.proportionalGain + foundPlayerSummary.profitableInvestment;
        ///////////////////
        foundPlayerSummary.playerId.inWalletCash += foundPlayerSummary.totalGain;
        foundPlayerSummary.playerId.totalAmountWon += foundPlayerSummary.totalGain;
        try {
            await foundPlayerSummary.save();
        } catch (err) {
            return next(new HttpError(err.message, err.statusCode));
        }
    }
    await res.json({
        game: game
    });
};
exports.makePlayerSummary = makePlayerSummary;
exports.updatePlayerSummary = updatePlayerSummary;
exports.getPlayerSummary = getPlayerSummary;