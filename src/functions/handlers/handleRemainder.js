import { db } from "../../utlis/prisma.js";
import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import { parseISO, isBefore, differenceInMinutes } from 'date-fns';

export default async (client) => {
  processMissedReminders(client);

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
        await sendReminder(reminder, client);
      }

      console.log(`${dueReminders.length} reminders have been processed.`);
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  });
};

async function processMissedReminders(client) {
  try {
    console.log('Checking for missed reminders...');

    const missedReminders = await db.reminder.findMany({
      where: {
        is_sent: false
      },
      include: {
        message: true,
        time: true
      }
    });

    const currentDate = new Date();

    for (const reminder of missedReminders) {
      const reminderDate = parseISO(`${reminder.time.year}-${reminder.time.month}-${reminder.time.day}T${reminder.time.hour}:${reminder.time.minute}:00`);

      console.log(`Processing reminder: ${reminder.reminder_id}, Scheduled for: ${reminderDate}, Current time: ${currentDate}`);

      if (isBefore(reminderDate, currentDate) && differenceInMinutes(currentDate, reminderDate) <= 60) {
        console.log(`Sending missed reminder: ${reminder.reminder_id}`);
        await sendReminder(reminder, client);
      } else if (isBefore(reminderDate, currentDate) && differenceInMinutes(currentDate, reminderDate) > 60) {
        await db.reminder.delete({
          where: { reminder_id: reminder.reminder_id }
        });
        console.log(`Deleted expired reminder: ${reminder.reminder_id}`);
      }
    }

    console.log(`${missedReminders.length} missed reminders have been processed.`);
  } catch (error) {
    console.error('Error processing missed reminders:', error);
  }
}

async function sendReminder(reminder, client) {
  try {
    const { message, channel_id, guild_id, created_by } = reminder;
    let guild;
    let channel;

    try {
      guild = client.guilds.cache.get(guild_id) || await client.guilds.fetch(guild_id);
    } catch (error) {
      console.error(`Error fetching guild with ID: ${guild_id}`, error);
      return;
    }

    try {
      channel = guild.channels.cache.get(channel_id) || await guild.channels.fetch(channel_id);
    } catch (error) {
      console.error(`Error fetching channel with ID: ${channel_id}`, error);
      return;
    }

    console.log(`Attempting to send reminder: ${reminder.reminder_id} to channel: ${channel?.name} in guild: ${guild?.name}`);

    if (channel && channel.isTextBased()) {
      const botMember = await guild.members.fetch(client.user.id);
      const permissions = channel.permissionsFor(botMember);
      if (!permissions.has('SEND_MESSAGES')) {
        console.error(`Bot does not have permission to send messages in channel: ${channel.name}`);
        return;
      }

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

      console.log(`Successfully sent reminder: ${reminder.reminder_id} to channel: ${channel.name}`);

      await db.reminder.delete({
        where: { reminder_id: reminder.reminder_id }
      });

      console.log('Reminder sent and deleted:', reminder.reminder_id);
    } else {
      console.error(`Channel not found or bot cannot access channel with ID: ${channel_id}`);
    }
  } catch (error) {
    console.error(`Error sending reminder: ${error.message}`);
  }
}

