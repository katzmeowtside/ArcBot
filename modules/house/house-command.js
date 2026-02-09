const { SlashCommandBuilder } = require('discord.js');
const houseSimulation = require('./simulation.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('house')
        .setDescription('Manage your house in the survival simulation')
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View your house status'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('repair')
                .setDescription('Repair your house')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount to repair (default: 10)')
                        .setMinValue(1)
                        .setMaxValue(50))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        await interaction.deferReply();

        try {
            // Initialize house if it doesn't exist
            await houseSimulation.initializeHouse(userId, username);
            
            if (subcommand === 'status') {
                // Generate and send the status image
                const imagePath = await houseSimulation.generateStatusImage(userId);
                
                // Send the image to the user
                await interaction.editReply({
                    content: `Here's your house status, ${interaction.user.username}:`,
                    files: [{ attachment: imagePath, name: 'house-status.png' }]
                });
            } else if (subcommand === 'repair') {
                const amount = interaction.options.getInteger('amount') || 10;
                
                const result = await houseSimulation.repairHouse(userId, amount);
                
                // Update the house status image after repair
                const imagePath = await houseSimulation.generateStatusImage(userId);
                
                await interaction.editReply({
                    content: `${result.message}\n\nUpdated house status:`,
                    files: [{ attachment: imagePath, name: 'house-status.png' }]
                });
            }
        } catch (error) {
            console.error('Error executing house command:', error);
            await interaction.editReply({
                content: `An error occurred: ${error.message}`
            });
        }
    }
};