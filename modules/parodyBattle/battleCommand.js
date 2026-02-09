const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const inviteHandler = require('./inviteHandler.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parody_battle')
        .setDescription('Start a parody battle with another user')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('The user to challenge to a parody battle')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tone')
                .setDescription('The tone of the parody battle')
                .addChoices(
                    { name: 'Mild', value: 'mild' },
                    { name: 'Chaotic', value: 'chaotic' },
                    { name: 'Feral', value: 'feral' }
                )
                .setRequired(true)),

    async execute(interaction) {
        const challenger = interaction.user;
        const opponent = interaction.options.getUser('opponent');
        const tone = interaction.options.getString('tone');

        // Validate that opponent is not the author
        if (challenger.id === opponent.id) {
            return await interaction.reply({
                content: 'You cannot challenge yourself to a parody battle!',
                ephemeral: true
            });
        }

        // Validate that opponent is not a bot
        if (opponent.bot) {
            return await interaction.reply({
                content: 'You cannot challenge a bot to a parody battle!',
                ephemeral: true
            });
        }

        // Create the battle invitation message with buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_battle_${challenger.id}_${opponent.id}`)
                    .setLabel('Accept Battle')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`decline_battle_${challenger.id}_${opponent.id}`)
                    .setLabel('Decline Battle')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({
            content: `<@${challenger.id}> has challenged <@${opponent.id}> to a parody battle!\nTone: **${tone}**\n\nDo you accept this challenge?`,
            components: [row],
            ephemeral: false
        });

        // Create a collector to listen for button clicks
        const filter = i => {
            // Check if the user clicking is the opponent and the button matches this specific challenge
            return i.user.id === opponent.id && 
                   (i.customId.startsWith(`accept_battle_${challenger.id}_${opponent.id}`) || 
                    i.customId.startsWith(`decline_battle_${challenger.id}_${opponent.id}`));
        };
        
        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
            max: 1,
            time: 30000 // 30 seconds to respond
        });

        collector.on('collect', async i => {
            if (i.customId.startsWith(`accept_battle_${challenger.id}_${opponent.id}`)) {
                await inviteHandler.handleAccept(i, challenger, opponent, tone);
            } else if (i.customId.startsWith(`decline_battle_${challenger.id}_${opponent.id}`)) {
                await inviteHandler.handleDecline(i, challenger, opponent);
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                // Time ran out, update the message
                interaction.editReply({
                    content: `<@${challenger.id}> has challenged <@${opponent.id}> to a parody battle!\nTone: **${tone}**\n\nTime expired. Challenge declined.`,
                    components: []
                }).catch(console.error);
            }
        });
    }
};

