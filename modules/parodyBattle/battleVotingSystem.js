const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const battleEngine = require('./battleEngine.js');
const battleRewards = require('./battleRewards.js');

class BattleVotingSystem {
    constructor() {
        // Store active votes by battle ID
        this.activeVotes = new Map();
    }

    /**
     * Create voting buttons for a battle
     * @param {string} battleId - The unique battle ID
     * @returns {ActionRowBuilder} The action row containing voting buttons
     */
    createVotingButtons(battleId) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`vote_user_a_${battleId}`)
                    .setLabel('🔥 Vote User A')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`vote_user_b_${battleId}`)
                    .setLabel('🔥 Vote User B')
                    .setStyle(ButtonStyle.Primary)
            );

        return row;
    }

    /**
     * Start the voting process for a battle
     * @param {Interaction} interaction - The Discord interaction
     * @param {string} battleId - The unique battle ID
     * @param {string} userAId - The ID of User A
     * @param {string} userBId - The ID of User B
     */
    async startVoting(interaction, battleId, userAId, userBId) {
        // Initialize vote tracking for this battle
        this.activeVotes.set(battleId, {
            battleId,
            userAId,
            userBId,
            userAVotes: 0,
            userBVotes: 0,
            voters: new Set(), // Track who has voted
            startTime: Date.now()
        });

        // Create the voting message with buttons
        const votingRow = this.createVotingButtons(battleId);

        await interaction.editReply({
            content: '🎤 **VOTING PHASE** 🎤\nCast your vote for the winner! You have 2 minutes.',
            components: [votingRow]
        });

        // Create a collector to listen for button clicks
        const filter = i => 
            i.customId.startsWith(`vote_user_a_${battleId}`) || 
            i.customId.startsWith(`vote_user_b_${battleId}`);

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
            time: 120000 // 2 minutes
        });

        collector.on('collect', async i => {
            await this.handleVote(i, battleId);
        });

        collector.on('end', () => {
            // Voting period ended, finalize results
            this.endVoting(interaction, battleId);
        });
    }

    /**
     * Handle individual vote
     * @param {Interaction} interaction - The button interaction
     * @param {string} battleId - The unique battle ID
     */
    async handleVote(interaction, battleId) {
        const voteData = this.activeVotes.get(battleId);
        if (!voteData) {
            await interaction.reply({
                content: 'This vote is no longer active.',
                ephemeral: true
            });
            return;
        }

        // Check if user has already voted
        if (voteData.voters.has(interaction.user.id)) {
            await interaction.reply({
                content: 'You have already voted in this battle!',
                ephemeral: true
            });
            return;
        }

        // Record the vote
        voteData.voters.add(interaction.user.id);

        if (interaction.customId.startsWith(`vote_user_a_${battleId}`)) {
            voteData.userAVotes++;
            await interaction.reply({
                content: `✅ You voted for User A!`,
                ephemeral: true
            });
        } else if (interaction.customId.startsWith(`vote_user_b_${battleId}`)) {
            voteData.userBVotes++;
            await interaction.reply({
                content: `✅ You voted for User B!`,
                ephemeral: true
            });
        }

        // Update the battle with current vote counts
        const battle = battleEngine.getBattleById(battleId);
        if (battle) {
            battle.voteCounts = {
                userA: voteData.userAVotes,
                userB: voteData.userBVotes
            };
        }
    }

    /**
     * End the voting process and announce results
     * @param {Interaction} interaction - The Discord interaction
     * @param {string} battleId - The unique battle ID
     */
    async endVoting(interaction, battleId) {
        const voteData = this.activeVotes.get(battleId);
        if (!voteData) {
            return;
        }

        // Determine winner based on votes
        let winnerId, winnerName, winnerDisplayName;
        if (voteData.userAVotes > voteData.userBVotes) {
            winnerId = voteData.userAId;
            winnerName = 'User A';
            winnerDisplayName = `User${winnerId.substring(0, 4)}`; // Placeholder name
        } else if (voteData.userBVotes > voteData.userAVotes) {
            winnerId = voteData.userBId;
            winnerName = 'User B';
            winnerDisplayName = `User${winnerId.substring(0, 4)}`; // Placeholder name
        } else {
            // Tie
            winnerName = 'TIE';
            winnerDisplayName = 'TIE';
        }

        // Update battle status
        battleEngine.completeBattle(battleId);
        
        // Update the battle with final vote counts
        const battle = battleEngine.getBattleById(battleId);
        if (battle) {
            battle.voteCounts = {
                userA: voteData.userAVotes,
                userB: voteData.userBVotes
            };
        }

        // Create results message
        let resultsMessage;
        if (winnerName === 'TIE') {
            resultsMessage = `🎤 **BATTLE RESULTS** 🎤\n\nIt's a tie! Both users showed great skills!\n\nFinal Score:\n🔥 User A: ${voteData.userAVotes} votes\n🔥 User B: ${voteData.userBVotes} votes`;
        } else {
            // Process rewards for the winner
            const rewardMessage = await battleRewards.processBattleRewards(
                winnerId, 
                winnerDisplayName, 
                winnerId === voteData.userAId ? voteData.userBId : voteData.userAId, 
                battle.voteCounts
            );
            
            resultsMessage = `🎤 **BATTLE RESULTS** 🎤\n\n🏆 **${winnerName} WINS!** 🏆\n\nFinal Score:\n🔥 User A: ${voteData.userAVotes} votes\n🔥 User B: ${voteData.userBVotes} votes\n\n${rewardMessage}`;
        }

        // Update the message to show results and disable buttons
        await interaction.editReply({
            content: resultsMessage,
            components: [] // Remove the buttons
        });

        // Clean up the vote data
        this.activeVotes.delete(battleId);
    }

    /**
     * Get current vote counts for a battle
     * @param {string} battleId - The unique battle ID
     * @returns {Object|null} Object with vote counts or null if not found
     */
    getVoteCounts(battleId) {
        const voteData = this.activeVotes.get(battleId);
        if (!voteData) {
            return null;
        }

        return {
            userA: voteData.userAVotes,
            userB: voteData.userBVotes,
            total: voteData.userAVotes + voteData.userBVotes
        };
    }

    /**
     * Check if a user has voted in a battle
     * @param {string} battleId - The unique battle ID
     * @param {string} userId - The user ID to check
     * @returns {boolean} True if the user has voted
     */
    hasUserVoted(battleId, userId) {
        const voteData = this.activeVotes.get(battleId);
        if (!voteData) {
            return false;
        }

        return voteData.voters.has(userId);
    }
}

// Export a singleton instance
module.exports = new BattleVotingSystem();