const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcement-stream')
    .setDescription('Announce a live stream')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Stream URL')
        .setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    await interaction.reply({ content: `@everyone ${url}`});
  }
};
