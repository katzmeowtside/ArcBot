const { EmbedBuilder } = require('discord.js');
const battleEngine = require('./battleEngine.js');

class BattleDisplay {
    /**
     * Create a Discord embed displaying both users' verses
     * @param {string} battleId - The unique battle ID
     * @param {string} userAName - The display name of User A
     * @param {string} userBName - The display name of User B
     * @param {string} tone - The battle tone
     * @returns {EmbedBuilder} The formatted Discord embed
     */
    createBattleEmbed(battleId, userAName, userBName, tone) {
        const battle = battleEngine.getBattleById(battleId);
        if (!battle) {
            throw new Error('Battle not found');
        }

        // Get the verses for both users
        const userAVerses = battleEngine.getUserVerses(battleId, battle.userA);
        const userBVerses = battleEngine.getUserVerses(battleId, battle.userB);

        // Get the most recent verse for each user
        const userAVerse = userAVerses.length > 0 ? userAVerses[userAVerses.length - 1] : 'Loading verse...';
        const userBVerse = userBVerses.length > 0 ? userBVerses[userBVerses.length - 1] : 'Loading verse...';

        // Truncate verses if they're too long for the embed
        const truncateText = (text, maxLength = 1000) => {
            if (text.length <= maxLength) {
                return text;
            }
            return text.substring(0, maxLength - 3) + '...';
        };

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('🎤 Parody Battle')
            .setDescription(`**${userAName.toUpperCase()} VS ${userBName.toUpperCase()}**\n**Tone: ${tone.toUpperCase()}**`)
            .setColor(this.getToneColor(tone))
            .addFields(
                {
                    name: `🎵 ${userAName}'s Verse`,
                    value: `\`\`\`${truncateText(userAVerse)}\`\`\``,
                    inline: false
                },
                {
                    name: `🎵 ${userBName}'s Verse`,
                    value: `\`\`\`${truncateText(userBVerse)}\`\`\``,
                    inline: false
                }
            )
            .setFooter({ text: 'Voting begins now.' })
            .setTimestamp();

        return embed;
    }

    /**
     * Create a battle results embed
     * @param {string} battleId - The unique battle ID
     * @param {string} userAName - The display name of User A
     * @param {string} userBName - The display name of User B
     * @param {string} tone - The battle tone
     * @param {string} winnerId - The ID of the winning user
     * @param {string} winnerName - The display name of the winning user
     * @returns {EmbedBuilder} The formatted Discord embed showing results
     */
    createResultsEmbed(battleId, userAName, userBName, tone, winnerId, winnerName) {
        const battle = battleEngine.getBattleById(battleId);
        if (!battle) {
            throw new Error('Battle not found');
        }

        // Get the verses for both users
        const userAVerses = battleEngine.getUserVerses(battleId, battle.userA);
        const userBVerses = battleEngine.getUserVerses(battleId, battle.userB);

        // Get the most recent verse for each user
        const userAVerse = userAVerses.length > 0 ? userAVerses[userAVerses.length - 1] : 'Loading verse...';
        const userBVerse = userBVerses.length > 0 ? userBVerses[userBVerses.length - 1] : 'Loading verse...';

        // Truncate verses if they're too long for the embed
        const truncateText = (text, maxLength = 1000) => {
            if (text.length <= maxLength) {
                return text;
            }
            return text.substring(0, maxLength - 3) + '...';
        };

        // Create the results embed
        const embed = new EmbedBuilder()
            .setTitle('🎤 Parody Battle Results')
            .setDescription(`**${userAName.toUpperCase()} VS ${userBName.toUpperCase()}**\n**Tone: ${tone.toUpperCase()}**`)
            .setColor(this.getToneColor(tone))
            .addFields(
                {
                    name: `🏆 WINNER: ${winnerName.toUpperCase()} 🏆`,
                    value: `Congratulations to ${winnerName} for winning this epic battle!`,
                    inline: false
                },
                {
                    name: `🎵 ${userAName}'s Verse`,
                    value: `\`\`\`${truncateText(userAVerse)}\`\`\``,
                    inline: false
                },
                {
                    name: `🎵 ${userBName}'s Verse`,
                    value: `\`\`\`${truncateText(userBVerse)}\`\`\``,
                    inline: false
                }
            )
            .setFooter({ text: `Battle ID: ${battleId}` })
            .setTimestamp();

        return embed;
    }

    /**
     * Get color based on tone
     * @param {string} tone - The battle tone
     * @returns {number} The color code
     */
    getToneColor(tone) {
        switch (tone.toLowerCase()) {
            case 'mild':
                return 0x4CAF50; // Green
            case 'chaotic':
                return 0xFF9800; // Orange
            case 'feral':
                return 0xF44336; // Red
            default:
                return 0x9E9E9E; // Gray
        }
    }

    /**
     * Create a battle invitation embed
     * @param {string} challengerName - The name of the user who initiated the challenge
     * @param {string} opponentName - The name of the user being challenged
     * @param {string} tone - The battle tone
     * @returns {EmbedBuilder} The formatted Discord embed for invitation
     */
    createInvitationEmbed(challengerName, opponentName, tone) {
        const embed = new EmbedBuilder()
            .setTitle('🎤 Parody Battle Challenge')
            .setDescription(`${challengerName} has challenged ${opponentName} to a parody battle!`)
            .addFields(
                { name: 'Challenger', value: challengerName, inline: true },
                { name: 'Opponent', value: opponentName, inline: true },
                { name: 'Tone', value: tone.charAt(0).toUpperCase() + tone.slice(1), inline: true }
            )
            .setColor(this.getToneColor(tone))
            .setFooter({ text: 'Waiting for opponent to accept...' })
            .setTimestamp();

        return embed;
    }
}

// Export a singleton instance
module.exports = new BattleDisplay();