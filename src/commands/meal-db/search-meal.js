import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('search-meal')
    .setDescription('Search for a meal')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The search name meal')
        .setRequired(true)),

  async execute(interaction) {
    const query = interaction.options.getString('name');

    async function searchMeal(query) {
      try {
        const response = await fetch(`https://themealdb.com/api/json/v1/1/search.php?s=${query}`);

        if (!response.ok) {
          throw new Error('Failed to fetch meal from themealdb.com');
        }

        const results = await response.json();

        const { strMeal, strMealThumb, strYoutube, strCategory, strTags } = await results?.meals[0]
        const tagsArray = strTags?.split(',');
        const tagsToString = tagsArray?.map(tag => `#${tag}`).join(', ');

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle(strMeal)
          .setImage(strMealThumb)
          .addFields(
            { name: "Tutorial", value: strYoutube },
            { name: "Category", value: strCategory },
            { name: "Tags", value: tagsToString },
          )
        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        console.error('Error searching for meal:', error);
        await interaction.reply({content:'Sorry, I could not find a meal with that query.', ephemeral: true});
      }
    }

    await searchMeal(query);
  },
};
