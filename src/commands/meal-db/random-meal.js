import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('random-meal')
    .setDescription('Show a random meal'),
  async execute(interaction) {
    async function getMeal() {
      try {
        const response = await fetch('https://themealdb.com/api/json/v1/1/random.php');

        if (!response.ok) {
          throw new Error('Failed to fetch meal from themealdb.com');
        }

        const mealData = await response.json();

        const { strMeal, strMealThumb, strYoutube, strCategory, strTags } = await mealData?.meals[0]
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
        console.error('Error fetching meme:', error);
        await interaction.reply({ content: 'Sorry, I could not fetch a the meal at this time.', ephemeral: true });
      }
    }
    await getMeal();
  },
};
