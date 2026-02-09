const { SlashCommandBuilder } = require('discord.js');
const urbanMythGenerator = require('./investigationSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myth')
        .setDescription('Investigate urban myths and mysteries')
        .addSubcommand(subcommand =>
            subcommand
                .setName('investigate')
                .setDescription('Investigate a random urban myth'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('discover')
                .setDescription('Discover a new urban myth'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('progress')
                .setDescription('Check progress on an active myth')
                .addIntegerOption(option =>
                    option.setName('myth_id')
                        .setDescription('The ID of the myth to check')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('solve')
                .setDescription('Attempt to solve a myth')
                .addIntegerOption(option =>
                    option.setName('myth_id')
                        .setDescription('The ID of the myth to solve')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        await interaction.deferReply();

        try {
            if (subcommand === 'investigate') {
                // Get a random active myth or create one if none exist
                const myth = await urbanMythGenerator.getRandomActiveMyth();
                
                // Generate an image for the myth
                const imagePath = await urbanMythGenerator.generateMythImage(myth.id);
                
                await interaction.editReply({
                    content: `🔍 **Urban Myth Investigation** 🔍\n\n**Location:** ${myth.location}\n**Phenomenon:** ${myth.phenomenon}\n**Witness Report:** ${myth.witness_report}\n\n**Myth ID:** ${myth.id}\n**Difficulty:** ${myth.difficulty}/3\n**Progress:** ${myth.progress}%\n**Clues Found:** ${myth.clues_found}`,
                    files: [{ attachment: imagePath, name: 'myth.png' }]
                });
            } else if (subcommand === 'discover') {
                // Create a new urban myth
                const myth = await urbanMythGenerator.createUrbanMyth();
                
                // Generate an image for the myth
                const imagePath = await urbanMythGenerator.generateMythImage(myth.id);
                
                await interaction.editReply({
                    content: `🔍 **New Urban Myth Discovered!** 🔍\n\n**Location:** ${myth.location}\n**Phenomenon:** ${myth.phenomenon}\n**Witness Report:** ${myth.witness_report}\n\n**Myth ID:** ${myth.id}\n**Difficulty:** ${myth.difficulty}/3\n**Progress:** ${myth.progress}%\n**Clues Found:** ${myth.clues_found}`,
                    files: [{ attachment: imagePath, name: 'myth.png' }]
                });
            } else if (subcommand === 'progress') {
                const mythId = interaction.options.getInteger('myth_id');
                
                const myth = await urbanMythGenerator.getUrbanMythById(mythId);
                
                if (!myth) {
                    await interaction.editReply({
                        content: `No myth found with ID: ${mythId}`
                    });
                    return;
                }
                
                await interaction.editReply({
                    content: `🔍 **Myth Progress Report** 🔍\n\n**Location:** ${myth.location}\n**Phenomenon:** ${myth.phenomenon}\n**Status:** ${myth.status}\n**Progress:** ${myth.progress}%\n**Clues Found:** ${myth.clues_found}\n**Difficulty:** ${myth.difficulty}/3`
                });
            } else if (subcommand === 'solve') {
                const mythId = interaction.options.getInteger('myth_id');
                
                const myth = await urbanMythGenerator.getUrbanMythById(mythId);
                
                if (!myth) {
                    await interaction.editReply({
                        content: `No myth found with ID: ${mythId}`
                    });
                    return;
                }
                
                if (myth.status === 'solved') {
                    await interaction.editReply({
                        content: `This myth has already been solved! It was ${myth.location} involving ${myth.phenomenon}.`
                    });
                    return;
                }
                
                // Attempt to solve the myth (requires reaching 100% progress)
                if (myth.progress >= 100) {
                    await urbanMythGenerator.markMythAsSolved(mythId);
                    
                    await interaction.editReply({
                        content: `🎉 **Myth Solved!** 🎉\n\nYou've successfully investigated the mystery at ${myth.location} involving ${myth.phenomenon}.\n\n**Final Report:** ${myth.witness_report}`
                    });
                } else {
                    // Add progress toward solving the myth
                    const progressIncrement = Math.floor(Math.random() * 20) + 10; // 10-30% progress
                    const cluesIncrement = Math.floor(Math.random() * 3) + 1; // 1-3 clues
                    
                    const result = await urbanMythGenerator.updateMythProgress(mythId, progressIncrement, cluesIncrement);
                    
                    if (result.solved) {
                        await interaction.editReply({
                            content: `🎉 **Myth Solved!** 🎉\n\nYou've successfully investigated the mystery at ${myth.location} involving ${myth.phenomenon}.\n\n**Final Report:** ${myth.witness_report}`
                        });
                    } else {
                        await interaction.editReply({
                            content: `🔍 **Investigation Progress** 🔍\n\nYou've made progress on myth ID ${mythId}!\n**Progress:** ${result.progress}%\n**Clues Found:** ${result.clues_found}\n\nKeep investigating to solve the mystery!`
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error executing myth command:', error);
            await interaction.editReply({
                content: `An error occurred: ${error.message}`
            });
        }
    }
};