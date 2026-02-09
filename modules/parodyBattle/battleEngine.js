const { v4: uuidv4 } = require('uuid');
const parodyGenerator = require('../evidence/parodySystem.js');
const { generateBattleVerseRound1 } = require('./battleVerseGenerator.js');
const battleVotingSystem = require('./battleVotingSystem.js');

class BattleEngine {
    constructor() {
        // Store active battles in memory, keyed by channel ID
        this.battlesByChannel = new Map();
        // Also store by battle ID for quick lookups
        this.battlesById = new Map();
    }

    /**
     * Create a new battle session
     * @param {string} channelId - The Discord channel ID where the battle takes place
     * @param {string} userAId - The ID of the first user
     * @param {string} userBId - The ID of the second user
     * @param {string} tone - The tone level for the battle
     * @returns {Object} The created battle session object
     */
    createBattle(channelId, userAId, userBId, tone) {
        const battleId = uuidv4(); // Generate a unique battle ID
        
        const battleSession = {
            id: battleId,
            channelId: channelId,
            userA: userAId,
            userB: userBId,
            tone: tone,
            status: 'pending', // pending, active, completed
            startTime: Date.now(),
            endTime: null,
            userAParody: null,
            userBParody: null
        };

        // Store in both maps for different lookup purposes
        this.battlesByChannel.set(channelId, battleSession);
        this.battlesById.set(battleId, battleSession);

        return battleSession;
    }

    /**
     * Start a battle session
     * @param {string} battleId - The unique battle ID
     * @returns {boolean} True if the battle was started successfully
     */
    startBattle(battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            return false;
        }

        battle.status = 'active';
        battle.startTime = Date.now();
        return true;
    }

    /**
     * Get a battle by channel ID
     * @param {string} channelId - The Discord channel ID
     * @returns {Object|null} The battle session object or null if not found
     */
    getBattleByChannel(channelId) {
        return this.battlesByChannel.get(channelId) || null;
    }

    /**
     * Get a battle by battle ID
     * @param {string} battleId - The unique battle ID
     * @returns {Object|null} The battle session object or null if not found
     */
    getBattleById(battleId) {
        return this.battlesById.get(battleId) || null;
    }

    /**
     * Generate battle verses for both users in the battle
     * @param {string} battleId - The unique battle ID
     * @returns {Promise<boolean>} True if battle verses were generated successfully
     */
    async generateBattleVerses(battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            return false;
        }

        try {
            // Get usernames for the users (would normally come from Discord API)
            // For now, we'll use placeholder names
            const userAName = `User${battle.userA.substring(0, 4)}`;
            const userBName = `User${battle.userB.substring(0, 4)}`;
            
            // Generate battle verse for user A targeting user B
            battle.userAVerses = battle.userAVerses || [];
            const userAVerse = generateBattleVerseRound1(userAName, userBName, battle.tone);
            battle.userAVerses.push(userAVerse);
            
            // Generate battle verse for user B targeting user A
            battle.userBVerses = battle.userBVerses || [];
            const userBVerse = generateBattleVerseRound1(userBName, userAName, battle.tone);
            battle.userBVerses.push(userBVerse);

            return true;
        } catch (error) {
            console.error('Error generating battle verses:', error);
            return false;
        }
    }

    /**
     * Generate parodies for both users in the battle
     * @param {string} battleId - The unique battle ID
     * @returns {Promise<boolean>} True if parodies were generated successfully
     */
    async generateBattleParodies(battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            return false;
        }

        try {
            // Generate parody for user A
            battle.userAParody = parodyGenerator.generateParody(
                "Random Song Title", 
                `Battle Topic for ${battle.userA}`, 
                battle.tone
            );
            
            // Generate parody for user B
            battle.userBParody = parodyGenerator.generateParody(
                "Random Song Title", 
                `Battle Topic for ${battle.userB}`, 
                battle.tone
            );

            // Store the generated parodies in the database
            await parodyGenerator.storeParody(
                "Random Song Title", 
                `Battle Topic for ${battle.userA}`, 
                battle.userAParody, 
                battle.tone
            );
            
            await parodyGenerator.storeParody(
                "Random Song Title", 
                `Battle Topic for ${battle.userB}`, 
                battle.userBParody, 
                battle.tone
            );

            return true;
        } catch (error) {
            console.error('Error generating battle parodies:', error);
            return false;
        }
    }

    /**
     * Get battle verses for a specific user in a battle
     * @param {string} battleId - The unique battle ID
     * @param {string} userId - The user ID to get verses for
     * @returns {Array} Array of verse texts for the user
     */
    getUserVerses(battleId, userId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            return [];
        }

        if (battle.userA === userId) {
            return battle.userAVerses || [];
        } else if (battle.userB === userId) {
            return battle.userBVerses || [];
        } else {
            return [];
        }
    }

    /**
     * Start the voting phase for a battle
     * @param {Interaction} interaction - The Discord interaction
     * @param {string} battleId - The unique battle ID
     */
    async startVotingPhase(interaction, battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            throw new Error('Battle not found');
        }

        // Start the voting process
        await battleVotingSystem.startVoting(
            interaction,
            battleId,
            battle.userA,
            battle.userB
        );
    }

    /**
     * Complete a battle session
     * @param {string} battleId - The unique battle ID
     * @returns {boolean} True if the battle was completed successfully
     */
    completeBattle(battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            return false;
        }

        battle.status = 'completed';
        battle.endTime = Date.now();
        return true;
    }

    /**
     * Remove a battle session
     * @param {string} battleId - The unique battle ID
     * @returns {boolean} True if the battle was removed successfully
     */
    removeBattle(battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle) {
            return false;
        }

        // Remove from both maps
        this.battlesById.delete(battleId);
        if (this.battlesByChannel.get(battle.channelId)?.id === battleId) {
            this.battlesByChannel.delete(battle.channelId);
        }
        
        return true;
    }

    /**
     * Get all active battles
     * @returns {Array} Array of active battle objects
     */
    getActiveBattles() {
        return Array.from(this.battlesById.values()).filter(battle => 
            battle.status === 'active' || battle.status === 'pending'
        );
    }

    /**
     * Check if a user is in an active battle
     * @param {string} userId - The user ID to check
     * @returns {Object|null} The battle object if the user is in a battle, null otherwise
     */
    getUserBattle(userId) {
        for (const battle of this.battlesById.values()) {
            if ((battle.userA === userId || battle.userB === userId) && 
                (battle.status === 'active' || battle.status === 'pending')) {
                return battle;
            }
        }
        return null;
    }

    /**
     * Get battle results
     * @param {string} battleId - The unique battle ID
     * @returns {Object|null} The battle results or null if not found
     */
    getBattleResults(battleId) {
        const battle = this.battlesById.get(battleId);
        if (!battle || battle.status !== 'completed') {
            return null;
        }

        return {
            id: battle.id,
            winner: this.determineWinner(battle), // Simple implementation - could be enhanced
            userA: {
                id: battle.userA,
                parody: battle.userAParody
            },
            userB: {
                id: battle.userB,
                parody: battle.userBParody
            },
            tone: battle.tone,
            duration: battle.endTime - battle.startTime
        };
    }

    /**
     * Determine the winner of a battle (simple implementation)
     * @param {Object} battle - The battle object
     * @returns {string} The user ID of the winner
     */
    determineWinner(battle) {
        // For now, randomly determine a winner
        // In a more advanced system, this could be based on user voting or other criteria
        return Math.random() > 0.5 ? battle.userA : battle.userB;
    }
}

// Export a singleton instance
module.exports = new BattleEngine();