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

      const truncatedSummary = summary.length > 2000 ? `${summary.substring(0, 1997)}...` : summary;

      await interaction.editReply(`**${page.title}**\n${truncatedSummary}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply('Terjadi kesalahan saat mencari di Wikipedia.');
    }
  }
};
