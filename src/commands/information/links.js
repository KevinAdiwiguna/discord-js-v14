import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config.json' with { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Show all links'),
  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('LINKS')
        .setDescription('Remi Links:')
        .addFields(
          config.links.map(res => ({ name: res.name, value: res.url }))
        )
        .setImage(config.thumbnail_url)
        .setTimestamp()
        .setFooter({ text: `develop by ${config.developer}`, iconURL: config.thumbnail_url })

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing command:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
};
