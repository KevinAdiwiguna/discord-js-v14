import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config.json' with { type: 'json' };

function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  const days = Math.floor(uptime / 86400);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('bot-information')
    .setDescription('Show information about the bot'),
  async execute(interaction) {
    try {
      const uptime = process.uptime();
      const formattedUptime = formatUptime(uptime);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({ name: config.developer, url: config.github, iconURL: config.github_logo})
        .setTitle('Bot Information')
        .setDescription('Information about the bot:')
        .addFields(
          { name: 'Uptime', value: formattedUptime },
          { name: 'BOT Name', value: config.bot_name },
          { name: 'Bot Repository', value: `${config.github} \n If you like this bot, please give a star to support its development!` },
        )
        .setImage(config.github_img_url)
        .setTimestamp()
        .setFooter({ text: config.developer, iconURL: config.thumbnail_url });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing command:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
};
