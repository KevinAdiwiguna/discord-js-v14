import { SlashCommandBuilder } from 'discord.js';
import { getJson } from '../../helpers/HttpUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('funfacts')
    .setDescription('shows a random fun fact'),
  Name: "funfacts",
  Category: "FUN",

  async execute(interaction) {
    try {
      const response = await getJson('https://uselessfacts.jsph.pl/random.json?language=en');
      if (response?.status === 404) {
        return interaction.reply({ content: "Failed to fetch fun fact", ephemeral: true })
      }
      const randomFact = await response?.data.text;
      interaction.reply(randomFact);
    } catch (error) {
      console.log(error)
      interaction.reply({content: 'An error occurred while fetching the fun fact.', ephemeral: true});
    }
  }
}