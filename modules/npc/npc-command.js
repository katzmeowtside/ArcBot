const { SlashCommandBuilder } = require('discord.js');
const npcSquatterSystem = require('./squatterSystem.js');
const houseSimulation = require('../house/simulation.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('npc')
        .setDescription('Manage NPCs in your house')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all NPCs in your house')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            if (subcommand === 'list') {
                // First, get the user's house
                const house = await houseSimulation.getHouseByUserId(userId);
                
                if (!house) {
                    await interaction.reply({
                        content: `You don't have a house yet. Use /house commands to set one up first.`,
                        ephemeral: true
                    });
                    return;
                }

                // Get NPCs associated with this user's house
                // Since we don't have a direct house_id column in npcs, we'll look for NPCs 
                // whose location or description mentions the house
                const npcs = await npcSquatterSystem.getNpcsForHouseAccurate(house.id);

                if (npcs.length === 0) {
                    // If no NPCs found, generate some for the house
                    await npcSquatterSystem.addNpcToHouse(house.id);
                    await npcSquatterSystem.addNpcToHouse(house.id); // Add 2 NPCs initially
                    
                    // Get the NPCs again
                    const newNpcs = await npcSquatterSystem.getNpcsForHouseAccurate(house.id);
                    
                    let npcListMessage = `🏠 NPCs in ${house.name}:\n\n`;
                    for (const npc of newNpcs) {
                        npcListMessage += `**${npc.name}** (${npc.type})\n`;
                        npcListMessage += `Hunger: ${npc.hunger}% | Energy: ${npc.energy}% | Paranoia: ${npc.paranoia}%\n`;
                        npcListMessage += `Trust: ${npc.trust}% | Aggression: ${npc.aggression}%\n`;
                        npcListMessage += `"${npc.dialogue}"\n\n`;
                    }
                    
                    await interaction.reply({
                        content: npcListMessage
                    });
                } else {
                    let npcListMessage = `🏠 NPCs in ${house.name}:\n\n`;
                    for (const npc of npcs) {
                        npcListMessage += `**${npc.name}** (${npc.type})\n`;
                        npcListMessage += `Hunger: ${npc.hunger}% | Energy: ${npc.energy}% | Paranoia: ${npc.paranoia}%\n`;
                        npcListMessage += `Trust: ${npc.trust}% | Aggression: ${npc.aggression}%\n`;
                        npcListMessage += `"${npc.dialogue}"\n\n`;
                    }
                    
                    await interaction.reply({
                        content: npcListMessage
                    });
                }
            }
        } catch (error) {
            console.error('Error executing npc command:', error);
            await interaction.reply({
                content: `An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    }
};