// Configuration file for Discord bot
require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN || '',
    battleRewards: {
        currency: {
            min: 50,
            max: 200,
            base: 100
        },
        reputation: {
            min: 5,
            max: 25,
            base: 15
        },
        factionMorale: {
            min: 2,
            max: 10,
            base: 5
        },
        radioListeners: {
            min: 10,
            max: 50,
            base: 25
        }
    }
};