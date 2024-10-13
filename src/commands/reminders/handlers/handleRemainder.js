import cron from 'node-cron';
import { db } from '../../../utlis/prisma.js';  // Pastikan jalur yang benar
import { parseISO, format } from 'date-fns';
import { ChannelType, EmbedBuilder } from 'discord.js';  // Mendukung EmbedBuilder dan ChannelType

// Fungsi untuk menjadwalkan pengingat
export async function scheduleReminder(reminder, client) {
  try {
    const { message, timeid } = reminder;

    // Pastikan pesan dimuat dengan benar
    if (!message || !message.content) {
      console.error(`Error scheduling reminder: Message not found for reminder with ID ${reminder.reminder_id}`);
      return;
    }

    const { content, images_url } = message;

    const dateStr = `${timeid.year}-${timeid.month.padStart(2, '0')}-${timeid.day.padStart(2, '0')}T${timeid.hour.padStart(2, '0')}:${timeid.minute.padStart(2, '0')}`;
    const date = parseISO(dateStr);

    const cronPattern = `${timeid.minute} ${timeid.hour} ${timeid.day} ${timeid.month} *`;

    // Jadwalkan pengingat menggunakan cron
    cron.schedule(cronPattern, async () => {
      try {
        const guild = client.guilds.cache.get(reminder.guild_id);
        if (!guild) return;

        const channel = guild.channels.cache.find(ch => ch.isTextBased() && ch.type === ChannelType.GuildText);
        if (!channel) return;

        // Buat EmbedBuilder untuk pengingat
        const embed = new EmbedBuilder()
          .setTitle('🔔 **Reminder System**')
          .setDescription(content)
          .setColor('#00FF00')  // Warna hijau untuk menunjukkan sukses
          .setTimestamp();  // Menggunakan timestamp saat pesan dikirim

        // Jika ada URL gambar, tambahkan gambar ke embed
        if (images_url) {
          embed.setImage(images_url);
        }

        // Kirim pengingat sebagai embed ke channel
        await channel.send({ embeds: [embed] });

        // Hapus data reminder, message, dan time setelah reminder dikirim
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

// Fungsi untuk menghapus reminder, message, dan time dari database
async function deleteReminderData(reminder) {
  try {
    const { message_id, time_id } = reminder;

    // Hapus data reminder terlebih dahulu
    await db.reminder.delete({
      where: { reminder_id: reminder.reminder_id }
    });

    // Periksa apakah message digunakan oleh reminder lain
    const otherRemindersWithMessage = await db.reminder.findMany({
      where: { message_id }
    });

    // Jika tidak ada reminder lain yang menggunakan message ini, hapus dari tabel Message
    if (otherRemindersWithMessage.length === 0) {
      await db.message.delete({
        where: { message_id }
      });
    }

    // Periksa apakah time digunakan oleh reminder lain
    const otherRemindersWithTime = await db.reminder.findMany({
      where: { time_id }
    });

    // Jika tidak ada reminder lain yang menggunakan time ini, hapus dari tabel Time
    if (otherRemindersWithTime.length === 0) {
      await db.time.delete({
        where: { time_id }
      });
    }

  } catch (error) {
    console.error('Error deleting reminder data:', error);
  }
}
