const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all bot commands and clears cache')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            await interaction.client.commandHandler.reloadCommands();
            await interaction.editReply('✅ All commands have been reloaded and cache cleared!');
        } catch (error) {
            console.error('Error during command reload:', error);
            await interaction.editReply(`❌ Error reloading commands: ${error.message}`);
        }
    }
};
