const { EmbedBuilder } = require('discord.js');
const parodyGenerator = require('../evidence/parodySystem.js');

class InviteHandler {
    constructor() {
        // Store active battles
        this.activeBattles = new Map();
    }

    /**
     * Handle the accept battle interaction
     * @param {Interaction} interaction - The button interaction
     * @param {User} challenger - The user who initiated the challenge
     * @param {User} opponent - The user who received the challenge
     * @param {string} tone - The tone of the battle
     */
    async handleAccept(interaction, challenger, opponent, tone) {
        try {
            // Store both user IDs in the active battles map
            const battleId = `${challenger.id}-${opponent.id}-${Date.now()}`;
            this.activeBattles.set(battleId, {
                challenger: challenger,
                opponent: opponent,
                tone: tone,
                timestamp: Date.now(),
                status: 'active'
            });

            // Update the message to show acceptance
            const acceptEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎤 Parody Battle Accepted!')
                .setDescription(`${opponent.username} has accepted ${challenger.username}'s challenge!`)
                .addFields(
                    { name: 'Challenger', value: `<@${challenger.id}>`, inline: true },
                    { name: 'Opponent', value: `<@${opponent.id}>`, inline: true },
                    { name: 'Tone', value: tone.charAt(0).toUpperCase() + tone.slice(1), inline: true }
                )
                .setTimestamp();

            await interaction.update({
                content: '',
                embeds: [acceptEmbed],
                components: [] // Remove the buttons
            });

            // Start the battle session
            await this.startBattleSession(interaction, battleId);

        } catch (error) {
            console.error('Error handling battle acceptance:', error);
            await interaction.reply({
                content: 'An error occurred while accepting the battle.',
                ephemeral: true
            });
        }
    }

    /**
     * Handle the decline battle interaction
     * @param {Interaction} interaction - The button interaction
     * @param {User} challenger - The user who initiated the challenge
     * @param {User} opponent - The user who received the challenge
     */
    async handleDecline(interaction, challenger, opponent) {
        try {
            // Update the message to show decline
            const declineEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Parody Battle Declined')
                .setDescription(`${opponent.username} has declined ${challenger.username}'s challenge.`)
                .addFields(
                    { name: 'Challenger', value: `<@${challenger.id}>`, inline: true },
                    { name: 'Opponent', value: `<@${opponent.id}>`, inline: true }
                )
                .setTimestamp();

            await interaction.update({
                content: '',
                embeds: [declineEmbed],
                components: [] // Remove the buttons
            });

        } catch (error) {
            console.error('Error handling battle decline:', error);
            await interaction.reply({
                content: 'An error occurred while declining the battle.',
                ephemeral: true
            });
        }
    }

    /**
     * Start the battle session after acceptance
     * @param {Interaction} interaction - The interaction object
     * @param {string} battleId - The unique battle ID
     */
    async startBattleSession(interaction, battleId) {
        try {
            const battleData = this.activeBattles.get(battleId);
            if (!battleData) {
                throw new Error('Battle data not found');
            }

            // Generate parodies for both users
            const challengerParody = parodyGenerator.generateParody(
                "Random Song Title", 
                `${battleData.challenger.username}'s Topic`, 
                battleData.tone
            );
            
            const opponentParody = parodyGenerator.generateParody(
                "Random Song Title", 
                `${battleData.opponent.username}'s Topic`, 
                battleData.tone
            );

            // Store the generated parodies in the database
            await parodyGenerator.storeParody(
                "Random Song Title", 
                `${battleData.challenger.username}'s Topic`, 
                challengerParody, 
                battleData.tone
            );
            
            await parodyGenerator.storeParody(
                "Random Song Title", 
                `${battleData.opponent.username}'s Topic`, 
                opponentParody, 
                battleData.tone
            );

            // Create battle results embed
            const resultsEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎭 Parody Battle Results')
                .setDescription('The battle has concluded! Here are the results:')
                .addFields(
                    { 
                        name: `🎤 ${battleData.challenger.username}'s Parody`, 
                        value: `\`\`\`${challengerParody.substring(0, 1000)}\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: `🎤 ${battleData.opponent.username}'s Parody`, 
                        value: `\`\`\`${opponentParody.substring(0, 1000)}\`\`\``, 
                        inline: false 
                    }
                )
                .setFooter({ text: `Battle ID: ${battleId}` })
                .setTimestamp();

            // Send the battle results
            await interaction.followUp({ embeds: [resultsEmbed] });

        } catch (error) {
            console.error('Error starting battle session:', error);
            await interaction.followUp({
                content: 'An error occurred while starting the battle session.',
                ephemeral: true
            });
        }
    }

    /**
     * Get active battle by ID
     * @param {string} battleId - The battle ID
     * @returns {Object|null} The battle data or null if not found
     */
    getActiveBattle(battleId) {
        return this.activeBattles.get(battleId) || null;
    }

    /**
     * Remove an active battle
     * @param {string} battleId - The battle ID to remove
     */
    removeActiveBattle(battleId) {
        this.activeBattles.delete(battleId);
    }
}

// Export a singleton instance
module.exports = new InviteHandler();