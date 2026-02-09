const config = require('../../config.js');
const db = require('../../database.js');

class BattleRewards {
    constructor() {
        // Reward types available
        this.rewardTypes = ['currency', 'reputation', 'factionMorale', 'radioListeners'];
    }

    /**
     * Calculate rewards for the battle winner
     * @param {string} winnerId - The ID of the winning user
     * @param {string} loserId - The ID of the losing user
     * @param {number} voteMargin - The margin by which the winner won
     * @returns {Object} The calculated rewards
     */
    calculateRewards(winnerId, loserId, voteMargin = 0) {
        const rewards = {};

        // Calculate rewards based on config values
        rewards.currency = this.calculateCurrencyReward(voteMargin);
        rewards.reputation = this.calculateReputationReward(voteMargin);
        rewards.factionMorale = this.calculateFactionMoraleReward(voteMargin);
        rewards.radioListeners = this.calculateRadioListenersReward(voteMargin);

        return rewards;
    }

    /**
     * Calculate currency reward based on vote margin
     * @param {number} voteMargin - The margin by which the winner won
     * @returns {number} The currency reward amount
     */
    calculateCurrencyReward(voteMargin) {
        const { min, max, base } = config.battleRewards.currency;
        // Higher rewards for larger margins
        const marginMultiplier = 1 + (voteMargin * 0.1); // 10% bonus per vote margin
        const reward = Math.min(max, Math.round(base * marginMultiplier));
        return Math.max(min, reward);
    }

    /**
     * Calculate reputation reward based on vote margin
     * @param {number} voteMargin - The margin by which the winner won
     * @returns {number} The reputation reward amount
     */
    calculateReputationReward(voteMargin) {
        const { min, max, base } = config.battleRewards.reputation;
        // Higher rewards for larger margins
        const marginMultiplier = 1 + (voteMargin * 0.05); // 5% bonus per vote margin
        const reward = Math.min(max, Math.round(base * marginMultiplier));
        return Math.max(min, reward);
    }

    /**
     * Calculate faction morale reward based on vote margin
     * @param {number} voteMargin - The margin by which the winner won
     * @returns {number} The faction morale reward amount
     */
    calculateFactionMoraleReward(voteMargin) {
        const { min, max, base } = config.battleRewards.factionMorale;
        // Higher rewards for larger margins
        const marginMultiplier = 1 + (voteMargin * 0.08); // 8% bonus per vote margin
        const reward = Math.min(max, Math.round(base * marginMultiplier));
        return Math.max(min, reward);
    }

    /**
     * Calculate radio listeners reward based on vote margin
     * @param {number} voteMargin - The margin by which the winner won
     * @returns {number} The radio listeners reward amount
     */
    calculateRadioListenersReward(voteMargin) {
        const { min, max, base } = config.battleRewards.radioListeners;
        // Higher rewards for larger margins
        const marginMultiplier = 1 + (voteMargin * 0.12); // 12% bonus per vote margin
        const reward = Math.min(max, Math.round(base * marginMultiplier));
        return Math.max(min, reward);
    }

    /**
     * Grant rewards to the winner
     * @param {string} winnerId - The ID of the winning user
     * @param {Object} rewards - The rewards to grant
     * @returns {Promise<boolean>} True if rewards were granted successfully
     */
    async grantRewards(winnerId, rewards) {
        try {
            // Update user's stats in the database
            await this.updateUserStats(winnerId, rewards);
            
            // Log the reward transaction
            await this.logRewardTransaction(winnerId, rewards);
            
            return true;
        } catch (error) {
            console.error('Error granting rewards:', error);
            return false;
        }
    }

    /**
     * Update user stats in the database
     * @param {string} userId - The ID of the user
     * @param {Object} rewards - The rewards to add
     */
    async updateUserStats(userId, rewards) {
        // This would typically update the user's profile in the database
        // For now, we'll log what would happen
        console.log(`Updating stats for user ${userId}:`, rewards);
        
        // Example implementation (would need actual database schema):
        /*
        await db.runQuery(
            `UPDATE user_profiles 
             SET currency = currency + ?, 
                 reputation = reputation + ?,
                 faction_morale_boost = faction_morale_boost + ?
             WHERE user_id = ?`,
            [rewards.currency, rewards.reputation, rewards.factionMorale, userId]
        );
        */
    }

    /**
     * Log the reward transaction
     * @param {string} userId - The ID of the user receiving rewards
     * @param {Object} rewards - The rewards granted
     */
    async logRewardTransaction(userId, rewards) {
        // Log the transaction for record keeping
        console.log(`Reward transaction logged for user ${userId}:`, rewards);
        
        // Example implementation (would need actual database schema):
        /*
        await db.runQuery(
            `INSERT INTO reward_transactions 
             (user_id, currency, reputation, faction_morale, radio_listeners, reason, timestamp) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                rewards.currency, 
                rewards.reputation, 
                rewards.factionMorale, 
                rewards.radioListeners,
                'Parody Battle Win',
                Date.now()
            ]
        );
        */
    }

    /**
     * Generate winner reward message
     * @param {string} winnerName - The name of the winning user
     * @param {Object} rewards - The rewards granted
     * @returns {string} The formatted reward message
     */
    generateWinnerMessage(winnerName, rewards) {
        return `🎉 Congratulations ${winnerName}! You won the parody battle! 🎉\n\n` +
               `**REWARDS EARNED:**\n` +
               `💰 **Currency:** +${rewards.currency}\n` +
               `⭐ **Reputation:** +${rewards.reputation}\n` +
               `🎭 **Faction Morale:** +${rewards.factionMorale}\n` +
               `📻 **Radio Listeners:** +${rewards.radioListeners}\n\n` +
               `Keep up the great work!`;
    }

    /**
     * Process battle rewards for the winner
     * @param {string} winnerId - The ID of the winning user
     * @param {string} winnerName - The name of the winning user
     * @param {string} loserId - The ID of the losing user
     * @param {Object} voteCounts - The final vote counts
     * @returns {Promise<string>} The reward message to display
     */
    async processBattleRewards(winnerId, winnerName, loserId, voteCounts) {
        // Calculate the vote margin
        const margin = Math.abs(voteCounts.userA - voteCounts.userB);
        
        // Calculate rewards based on the margin
        const rewards = this.calculateRewards(winnerId, loserId, margin);
        
        // Grant the rewards to the winner
        const success = await this.grantRewards(winnerId, rewards);
        
        if (success) {
            // Generate and return the winner message
            return this.generateWinnerMessage(winnerName, rewards);
        } else {
            // Return a message indicating there was an issue
            return `🎉 Congratulations ${winnerName}! You won the parody battle! 🎉\n\n` +
                   `Unfortunately, there was an issue granting your rewards. Please contact an admin.`;
        }
    }
}

// Export a singleton instance
module.exports = new BattleRewards();