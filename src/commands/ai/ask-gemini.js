import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai'

export default {
  data: new SlashCommandBuilder()
    .setName('ask-gemini')
    .setDescription('ask gemini')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The search query')
        .setRequired(true)),

  async execute(interaction) {
		await interaction.deferReply();
    const query = interaction.options.getString('query');

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" })
    try {
      const { response } = await model.generateContent(query)
      await interaction.editReply({ content: response.text() });
    } catch (error) {
      console.error('Error searching for meme:', error);
      await interaction.editReply({ content: 'Sorry, I could not find a meme with that query.', ephemeral: true });
    }
  }
};
