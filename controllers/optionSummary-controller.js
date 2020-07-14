// const HttpError = require('../models/http-error');
// const User = require('../models/user');
// const mongoose = require('mongoose');
// const Game = require('../models/game');
// const makeOptionSummary = async (req, res, next) => {
//     // const gameId = req.params.gid;
//     // // const userId = req.userData.userId;
//     // let game;
//     // try {
//     //     game = await Game.findById(gameId);
//     // } catch (err) {
//     //     return next(new HttpError("Error fetching game please try again later!!", 404));
//     // }
//     // if (game) {
//     //     console.log(game);
//     //     let optionSummary;
//     //     const {totalInvestment, optedOptions} = req.body;
//     //     playerSummary = await PlayerSummary({
//     //         totalInvestment, optedOptions, gameId, playerId: userId
//     //     });
//     //     try {
//     //         const sess = await mongoose.startSession();
//     //         sess.startTransaction();
//     //         game.playerSummary.push(playerSummary);
//     //         game.playerCount = game.playerCount +1;
//     //         game.gameInvestment += totalInvestment;
//     //         optedOptions.forEach((element) => {
//     //             if (element === constants.spade) {
//     //                 game.spadesTotalInvestment += game.betValue;
//     //             }
//     //             else if (element === constants.club) {
//     //                 game.clubTotalInvestment += game.betValue;
//     //             }
//     //             else if (element === constants.heart) {
//     //                 game.heartTotalInvestment += game.betValue;
//     //             }
//     //             else {
//     //                 game.diamondTotalInvestment += game.betValue;
//     //             }
//     //         });
//     //         await game.save();
//     //         await playerSummary.save();
//     //         await sess.commitTransaction();
//     //     } catch (err) {
//     //         return next(new HttpError(err.message, 404));
//     //     }
//     //     await res.json({
//     //         message: "player created",playerSummary:playerSummary
//     //     });
//     // } else {
//     //     await res.json({
//     //         message: "game dosen't exist"
//     //     });
//     // }
// };
// exports.makeOptionSummary = makeOptionSummary;