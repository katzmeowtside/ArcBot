const { SlashCommandBuilder } = require('discord.js');
const factionSystem = require('./factionSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faction')
        .setDescription('Manage factions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new faction')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the faction')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Join an existing faction')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the faction to join')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            if (subcommand === 'create') {
                const factionName = interaction.options.getString('name');
                
                // Check if user already has a faction
                const userFaction = await factionSystem.getUserFaction(userId);
                if (userFaction) {
                    await interaction.reply({
                        content: `You are already a member of the faction "${userFaction.name}".`,
                        ephemeral: true
                    });
                    return;
                }
                
                try {
                    const faction = await factionSystem.createFaction(factionName, userId, username);
                    
                    await interaction.reply({
                        content: `Faction "${faction.name}" has been created successfully!\nYou are the leader of this faction.`
                    });
                } catch (error) {
                    await interaction.reply({
                        content: `Error creating faction: ${error.message}`,
                        ephemeral: true
                    });
                }
            } else if (subcommand === 'join') {
                const factionName = interaction.options.getString('name');
                
                // Check if user already has a faction
                const userFaction = await factionSystem.getUserFaction(userId);
                if (userFaction) {
                    await interaction.reply({
                        content: `You are already a member of the faction "${userFaction.name}".`,
                        ephemeral: true
                    });
                    return;
                }
                
                try {
                    // Find the faction by name
                    const faction = await factionSystem.getFactionByName(factionName);
                    if (!faction) {
                        await interaction.reply({
                            content: `Faction "${factionName}" does not exist.`,
                            ephemeral: true
                        });
                        return;
                    }
                    
                    // Join the faction
                    await factionSystem.joinFaction(userId, username, faction.id);
                    
                    await interaction.reply({
                        content: `You have successfully joined the faction "${faction.name}"!`
                    });
                } catch (error) {
                    await interaction.reply({
                        content: `Error joining faction: ${error.message}`,
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Error executing faction command:', error);
            await interaction.reply({
                content: `An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    }
};