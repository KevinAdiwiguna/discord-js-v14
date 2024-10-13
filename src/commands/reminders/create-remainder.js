import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';
import { parseISO, isFuture, isValid } from 'date-fns';
import { scheduleReminder } from './handlers/handleRemainder.js';  // Pastikan ini benar

export default {
  data: new SlashCommandBuilder()
    .setName('create-remainder')
    .setDescription('Create a remainder')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to remind')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('day')
        .setDescription('1-31')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('hour')
        .setDescription('1-24')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('minute')
        .setDescription('1-60')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('month')
        .setDescription('1-12')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('year')
        .setDescription('xxxx')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image-url')
        .setDescription('URL of the image to include with the reminder')
        .setRequired(false)),

  Name: "create-remainder",
  Category: "REMAINDERS",

  async execute(interaction) {
    try {
      const messageContent = interaction.options.getString('message');
      const day = interaction.options.getString('day');
      const hour = interaction.options.getString('hour');
      const minute = interaction.options.getString('minute');
      const month = interaction.options.getString('month');
      const year = interaction.options.getString('year');
      const imageUrl = interaction.options.getString('image-url');  // URL gambar jika disediakan

      // Validasi tanggal dan waktu
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
      const date = parseISO(dateStr);

      if (!isValid(date) || !isFuture(date)) {
        return interaction.reply({ content: 'The provided date and time are invalid or in the past.', ephemeral: true });
      }

      // Masukkan waktu ke tabel Time
      const timeRecord = await db.time.create({
        data: {
          day: day,
          month: month,
          year: year,
          hour: hour,
          minute: minute,
        },
      });

      // Masukkan pesan ke tabel Message, termasuk URL gambar jika ada
      const messageRecord = await db.message.create({
        data: {
          content: messageContent,
          type: 'REMINDER',
          images_url: imageUrl || null,  // Jika tidak ada gambar, simpan null
        },
      });

      // Masukkan pengingat ke tabel Reminder dengan relasi ke message dan time
      const reminderRecord = await db.reminder.create({
        data: {
          guild_id: interaction.guildId,
          message_id: messageRecord.message_id,
          time_id: timeRecord.time_id,
        },
      });

      // Ambil pengingat kembali dari database dengan semua relasi yang diperlukan
      const reminderWithDetails = await db.reminder.findUnique({
        where: { reminder_id: reminderRecord.reminder_id },
        include: {
          message: true,
          timeid: true
        }
      });

      // Pastikan pengingat dan pesan terkait ada sebelum menjadwalkan pengingat
      if (!reminderWithDetails || !reminderWithDetails.message) {
        return interaction.reply({ content: 'Error: Reminder could not be scheduled because the message was not found.', ephemeral: true });
      }

      // Jadwalkan pengingat menggunakan cron
      scheduleReminder(reminderWithDetails, interaction.client);

      // Buat embed untuk menunjukkan detail pengingat yang baru saja dibuat
      const embed = new EmbedBuilder()
        .setTitle('Reminder Created Successfully!')
        .setDescription(`Here are the details of the reminder you just created:`)
        .addFields(
          { name: 'Message', value: messageContent, inline: false },
          { name: 'Date', value: `${day}/${month}/${year}`, inline: true },
          { name: 'Time', value: `${hour}:${minute}`, inline: true }
        )
        .setColor('#00FF00')  // Hijau untuk menunjukkan sukses
        .setFooter({ text: 'Reminder created' })
        .setTimestamp();

      // Jika URL gambar ada, tambahkan ke embed
      if (imageUrl) {
        embed.setImage(imageUrl);
      }

      // Kirim respons embed
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

    } catch (error) {
      console.error('Error creating reminder:', error);
      return interaction.reply({
        content: 'There was an error while creating the reminder. Please try again later.',
        ephemeral: true,
      });
    }
  }
};
