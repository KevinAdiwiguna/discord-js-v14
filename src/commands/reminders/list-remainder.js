import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list-reminder')
    .setDescription('List all reminders in this guild'),

  Name: "list-reminder",
  Category: "REMINDERS",

  async execute(interaction) {
    try {
      const guildId = interaction.guildId;

      const reminders = await db.reminder.findMany({
        where: { guild_id: guildId },
        include: {
          message: true,
          time: true
        }
      });

      if (reminders.length === 0) {
        return interaction.reply({ content: 'There are no reminders set for this guild.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('List of Reminders')
        .setColor('#0099ff')
        .setDescription('Here are all the reminders for this guild:')
        .setTimestamp();

      reminders.forEach((reminder, index) => {
        const { content, images_url } = reminder.message;
        const { day, month, year, hour, minute } = reminder.time;
        const channel = interaction.guild.channels.cache.get(reminder.channel_id);

        const channelName = channel ? `#${channel.name}` : 'Unknown Channel';

        embed.addFields({
          name: `Reminder #${index + 1} (ID: ${reminder.reminder_id})`,
          value: `**Message**: ${content}\n**Date**: ${day}/${month}/${year} ${hour}:${minute}\n**Channel**: ${channelName}`,
          inline: false
        });

        if (images_url) {
          embed.addFields({ name: 'Image URL', value: images_url, inline: false });
        }
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error listing reminders:', error);
      return interaction.reply({
        content: 'There was an error retrieving the list of reminders. Please try again later.',
        ephemeral: true
      });
    }
  }
};
