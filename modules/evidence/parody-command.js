const { SlashCommandBuilder } = require('discord.js');
const parodyGenerator = require('./parodySystem.js');
const albumCoverGenerator = require('./albumCoverGenerator.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parody')
        .setDescription('Generate parody song lyrics')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The original song title to parody')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('The topic/theme for the parody')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tone')
                .setDescription('The tone of the parody')
                .addChoices(
                    { name: 'Mild', value: 'mild' },
                    { name: 'Chaotic', value: 'chaotic' },
                    { name: 'Feral', value: 'feral' }
                )
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('perform')
                .setDescription('Generate a cover image for the parody')
                .setRequired(false)),

    async execute(interaction) {
        const songTitle = interaction.options.getString('song');
        const topic = interaction.options.getString('topic');
        const tone = interaction.options.getString('tone') || 'mild';
        const perform = interaction.options.getBoolean('perform') || false;

        try {
            // Generate the parody lyrics with the specified tone
            const lyrics = parodyGenerator.generateParody(songTitle, topic, tone);

            // Store the generated parody in the database
            await parodyGenerator.storeParody(songTitle, topic, lyrics, tone);

            if (perform) {
                // Generate album cover
                const coverResult = await albumCoverGenerator.generateAlbumCover(songTitle, topic);
                
                // Send the lyrics and cover image to the user
                const { AttachmentBuilder } = require('discord.js');
                const attachment = new AttachmentBuilder(coverResult.filepath);
                
                await interaction.reply({
                    content: lyrics,
                    files: [attachment],
                    ephemeral: false // Make visible to everyone in the channel
                });
            } else {
                // Send only the lyrics to the user
                await interaction.reply({
                    content: lyrics,
                    ephemeral: false // Make visible to everyone in the channel
                });
            }
        } catch (error) {
            console.error('Error executing parody command:', error);
            await interaction.reply({
                content: `An error occurred while generating the parody: ${error.message}`,
                ephemeral: true
            });
        }
    }
};