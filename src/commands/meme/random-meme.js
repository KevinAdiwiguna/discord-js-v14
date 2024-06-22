import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('random-meme')
    .setDescription('Show a random meme'),
  async execute(interaction) {
    async function getMeme() {
      try {
        const response = await fetch('https://www.reddit.com/r/memes/random/.json', {
          headers: {
            'User-Agent': 'remibot'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch meme from Reddit');
        }

        const memeData = await response.json();
        const { title, url: image, author } = memeData[0].data.children[0].data;

        const embed = new EmbedBuilder()
          .setColor('#FF4500')
          .setTitle(title)
          .setImage(image)
          .setURL(image)
          .setFooter({ text: `Author: ${author}` });

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching meme:', error);
        await interaction.reply('Sorry, I could not fetch a meme at this time.');
      }
    }

    await getMeme();
  },
};
