const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const gameSchema = new Schema({
    slotId: {type: mongoose.Types.ObjectId, ref: 'Slot', required: true},
    betValue: {type: Number, required: true},
    isComplete: {type: Boolean, default: false},
    //////////////////////////////////////////////////
    distributableProfitPercent: {type: Number, default: 0, required: true},
    businessProfit: {type: Number, default: 0, required: true},
    distributableProfit: {type: Number, default: 0, required: true},
    totalProfit: {type: Number, default: 0, required: true},
    gameInvestment: {type: Number, default: 0, required: true},
    playerCount: {type: Number, default: 0, required: true},
    droppedOptions: [{type: String, required: true, default: 0}],
    spadesTotalInvestment: {type: Number, default: 0, required: true},
    heartTotalInvestment: {type: Number, default: 0, required: true},
    diamondTotalInvestment: {type: Number, default: 0, required: true},
    clubTotalInvestment: {type: Number, default: 0, required: true},
    //////////////////////////////////////////////////
    // optionSummary: [{type: mongoose.Types.ObjectId, ref: 'OptionSummary', required: true}],
    playerSummary: [{type: mongoose.Types.ObjectId, ref: 'PlayerSummary', required: true}],
});

module.exports = mongoose.model('Game', gameSchema);
