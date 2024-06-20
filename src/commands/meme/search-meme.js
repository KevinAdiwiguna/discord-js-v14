const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search-meme')
    .setDescription('Search for a meme')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The search query')
        .setRequired(true)),
  async execute(interaction) {
    const query = interaction.options.getString('query');

    async function searchMeme(query) {
      try {
        const response = await fetch(`https://www.reddit.com/r/memes/search.json?q=${encodeURIComponent(query)}&restrict_sr=1`, {
          headers: {
            'User-Agent': 'remibot'
          }
        });
        console.log(response.status)

        const results = await response.json();
        if (!results || !Array.isArray(results.data.children) || results.data.children.length === 0) {
          throw new Error('No memes found');
        }

        const meme = results.data.children[0].data;
        const { title, url: image, author } = meme;

        const embed = new EmbedBuilder()
          .setColor('Random')
          .setTitle(title)
          .setImage(image)
          .setURL(image)
          .setFooter({ text: `Author: ${author}` });

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply('Sorry, I could not find a meme with that query.');
      }
    }

    searchMeme(query);
  }
};
