const { SlashCommandBuilder } = require('discord.js');
const radioSystem = require('./radioSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Manage your pirate radio station')
        .addSubcommand(subcommand =>
            subcommand
                .setName('broadcast')
                .setDescription('Send a broadcast from your radio station')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to broadcast')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create your own pirate radio station'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about your radio station'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('upgrade')
                .setDescription('Upgrade your radio equipment')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            if (subcommand === 'create') {
                try {
                    const station = await radioSystem.createRadioStation(userId, username);
                    
                    await interaction.reply({
                        content: `Radio station "${station.station_name}" has been created!\nSignal Strength: ${station.signal_strength}/100\nEquipment Level: ${station.equipment_level}\nListeners: ${station.listeners}`
                    });
                } catch (error) {
                    await interaction.reply({
                        content: `Error creating radio station: ${error.message}`,
                        ephemeral: true
                    });
                }
            } else if (subcommand === 'broadcast') {
                const message = interaction.options.getString('message');
                
                try {
                    const result = await radioSystem.broadcast(userId, message);
                    
                    await interaction.reply({
                        content: `${result.message}\n\nListeners: ${result.listeners}\nSignal Strength: ${result.signalStrength}/100\nEquipment Level: ${result.equipmentLevel}\nPower Remaining: ${result.powerRemaining}`
                    });
                } catch (error) {
                    await interaction.reply({
                        content: `Error broadcasting: ${error.message}`,
                        ephemeral: true
                    });
                }
            } else if (subcommand === 'info') {
                try {
                    const station = await radioSystem.getRadioStationByUserId(userId);
                    
                    if (!station) {
                        await interaction.reply({
                            content: 'You do not have a radio station. Use /radio create to start one.',
                            ephemeral: true
                        });
                        return;
                    }
                    
                    await interaction.reply({
                        content: `**${station.station_name}**\n\nSignal Strength: ${station.signal_strength}/100\nListeners: ${station.listeners}\nEquipment Level: ${station.equipment_level}\nPower: ${station.power}\nParts: ${station.parts}`
                    });
                } catch (error) {
                    await interaction.reply({
                        content: `Error getting station info: ${error.message}`,
                        ephemeral: true
                    });
                }
            } else if (subcommand === 'upgrade') {
                try {
                    const result = await radioSystem.upgradeEquipment(userId);
                    
                    await interaction.reply({
                        content: `Equipment upgraded to level ${result.newLevel}!\nParts remaining: ${result.partsRemaining}`
                    });
                } catch (error) {
                    await interaction.reply({
                        content: `Error upgrading equipment: ${error.message}`,
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Error executing radio command:', error);
            await interaction.reply({
                content: `An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    }
};