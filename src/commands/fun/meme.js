import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getJson } from '../../helpers/HttpUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('send a random meme'),
  Name: "meme",
  Category: "FUN",

  async execute(interaction) {
    try {
      const response = await getJson('https://meme-api.com/gimme');
      if (response?.status === 404) {
        return interaction.reply({ content: "Fild to fetch meme", ephemeral: true })
      }
      const randomMeme = await response?.data;

      const embed = new EmbedBuilder()
        .setTitle(randomMeme.title)
        .setURL(randomMeme.preview[0])
        .setImage(randomMeme.url)
        .setColor('#0099ff')
        .setFooter({ text: `Author: ${randomMeme.author}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply('An error occurred while fetching the meme.');
    }

  }
}