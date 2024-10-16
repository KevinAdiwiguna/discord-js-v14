import cron from 'node-cron';
import { db } from '../../../utlis/prisma.js';
import { parseISO, format } from 'date-fns';
import { ChannelType, EmbedBuilder } from 'discord.js';

export async function scheduleReminder(reminder, client) {
  try {
    const { message, time, channel_id, created_by } = reminder;

    if (!message || !message.content) {
      console.error(`Error scheduling reminder: Message not found for reminder with ID ${reminder.reminder_id}`);
      return;
    }

    const { content, images_url } = message;

    const dateStr = `${time.year}-${time.month.padStart(2, '0')}-${time.day.padStart(2, '0')}T${time.hour.padStart(2, '0')}:${time.minute.padStart(2, '0')}`;
    const date = parseISO(dateStr);

    const cronPattern = `${time.minute} ${time.hour} ${time.day} ${time.month} *`;

    cron.schedule(cronPattern, async () => {
      try {
        const guild = client.guilds.cache.get(reminder.guild_id);
        if (!guild) return;

        const channel = guild.channels.cache.get(channel_id);
        if (!channel || channel.type !== ChannelType.GuildText) {
          console.error(`Error: Channel with ID ${channel_id} not found or invalid.`);
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle('🔔 **Reminder System**')
          .setDescription(content)
          .setColor('#00FF00')
          .setTimestamp()
          .setFooter({ text: `Reminder created by ${created_by}` });

        if (images_url) {
          embed.setImage(images_url);
        }

        await channel.send({ embeds: [embed] });

        await deleteReminderData(reminder);

        console.log(`Reminder with ID ${reminder.reminder_id} has been sent and deleted.`);
      } catch (error) {
        console.error(`Error sending reminder: ${error.message}`);
      }
    });

    console.log(`Reminder for ${format(date, 'yyyy-MM-dd HH:mm')} has been scheduled.`);
  } catch (error) {
    console.error(`Error scheduling reminder: ${error.message}`);
  }
}

async function deleteReminderData(reminder) {
  try {
    await db.reminder.delete({
      where: { reminder_id: reminder.reminder_id }
    });

    console.log(`Reminder with ID ${reminder.reminder_id} and associated data has been deleted.`);
  } catch (error) {
    console.error('Error deleting reminder data:', error);
  }
}
