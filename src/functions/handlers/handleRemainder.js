import { db } from "../../utlis/prisma.js";
import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';

export default async (client) => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Checking for due reminders...');

      const dueReminders = await db.reminder.findMany({
        where: {
          is_sent: false,
          time: {
            year: { equals: new Date().getFullYear().toString() },
            month: { equals: (new Date().getMonth() + 1).toString().padStart(2, '0') },
            day: { equals: new Date().getDate().toString().padStart(2, '0') },
            hour: { equals: new Date().getHours().toString().padStart(2, '0') },
            minute: { equals: new Date().getMinutes().toString().padStart(2, '0') }
          }
        },
        include: {
          message: true,
          time: true
        }
      });

      for (const reminder of dueReminders) {
        const { message, channel_id, guild_id, created_by } = reminder;
        const guild = client.guilds.cache.get(guild_id);
        const channel = guild?.channels.cache.get(channel_id);

        if (channel) {
          const embed = new EmbedBuilder()
            .setTitle('🔔 Reminder')
            .setDescription(message.content)
            .setColor('#00FF00')
            .setFooter({ text: `Reminder created by ${created_by}` })
            .setTimestamp();

          if (message.images_url) {
            embed.setImage(message.images_url);
          }

          await channel.send({ embeds: [embed] });

          await db.reminder.update({
            where: { reminder_id: reminder.reminder_id },
            data: { is_sent: true }
          });

          console.log('Reminder sent:', reminder.reminder_id);
        }
      }

      console.log(`${dueReminders.length} reminders have been processed.`);
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  });
};
