const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask-ai')
    .setDescription('/ask-ai. ask ai')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The search query')
        .setRequired(true)),
  async execute(interaction) {
    const query = interaction.options.getString('query');

    async function fetchAI() {
      try {
        const response = await fetch(process.env.CELOT_SERVER_ADDRESS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            API_KEY: process.env.CELOT_API_KEY,
            content: query
          }),
        });
        const data = await response.json();
        await interaction.reply(data.record);
      } catch (error) {
        console.log(error)
        await interaction.reply('Sorry, I could not fetch get response at this timse.');
      }
    }
    fetchAI();
  }
};
