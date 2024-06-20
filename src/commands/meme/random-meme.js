const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-meme')
    .setDescription('/random-meme. Show random meme'),
  async execute(interaction) {

    async function getMeme() {
      try {
        const response = await fetch('https://www.reddit.com/r/memes/random/.json', {
          headers: {
            'User-Agent': 'remibot'
          }
        });
        console.log(response.status)

        const meme = await response.json();
        const { title, url: image, author } = meme[0].data.children[0].data;

        const embed = new EmbedBuilder()
          .setColor('Random')
          .setTitle(title)
          .setImage(image)
          .setURL(image)
          .setFooter({ text: `Author: ${author}` });

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply('Sorry, I could not fetch a meme at this time.');
      }
    }

    getMeme();
  }
};
