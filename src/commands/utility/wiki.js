import { SlashCommandBuilder } from 'discord.js';
import wiki from 'wikijs';

export default {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Cari di Wikipedia')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Kata kunci pencarian')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query');

    try {
      const search = await wiki().search(query);
      if (search.results.length === 0) {
        await interaction.editReply(`Tidak ditemukan hasil untuk "${query}".`);
        return;
      }

      const page = await wiki().page(search.results[0]);
      const summary = await page.summary();

      const maxCharacters = 2000;
      const title = `**${page.title}**\n`;
      let content = title + summary;

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

      const messages = splitMessage(content, maxCharacters);

      await interaction.editReply({ content: messages[0] });

      for (let i = 1; i < messages.length; i++) {
        await interaction.followUp({ content: messages[i] });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({content: 'Terjadi kesalahan saat mencari di Wikipedia.', ephemeral: true});
    }
  }
};
