import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default {
  data: new SlashCommandBuilder()
    .setName('ask-gemini')
    .setDescription('Ask Gemini')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The search query')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query');

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    try {
      const { response } = await model.generateContent(query);
      const fullResponse = response.text();

      // Function to split content into chunks without breaking words
      function splitMessage(content, maxLength) {
        const parts = [];
        let currentIndex = 0;

        while (currentIndex < content.length) {
          let nextIndex = currentIndex + maxLength;
          if (nextIndex < content.length) {
            while (content[nextIndex] !== ' ' && nextIndex > currentIndex) {
              nextIndex--;
            }
          }
          parts.push(content.slice(currentIndex, nextIndex).trim());
          currentIndex = nextIndex;
        }

        return parts;
      }

      const maxCharacters = 2000;
      const messages = splitMessage(fullResponse, maxCharacters);

      // Kirim pesan pertama
      await interaction.editReply({ content: messages[0] });

      // Kirim sisa pesan jika ada
      for (let i = 1; i < messages.length; i++) {
        await interaction.followUp({ content: messages[i] });
      }
    } catch (error) {
      console.error('gemini error:', error);
      await interaction.editReply({
        content: 'Terjadi kesalahan saat mencari di Gemini.',
        ephemeral: true
      });
    }
  }
};
