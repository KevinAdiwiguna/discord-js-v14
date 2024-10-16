import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { parseISO, isFuture, isValid } from 'date-fns';
import { db } from '../../utlis/prisma.js'; 
import { scheduleReminder } from './handlers/handleRemainder.js'; 

export default {
  data: new SlashCommandBuilder()
    .setName('create-reminder')
    .setDescription('Create a reminder')
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
        .setDescription('0-23')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('minute')
        .setDescription('0-59')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('month')
        .setDescription('1-12')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('year')
        .setDescription('YYYY')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where the reminder will be sent')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image-url')
        .setDescription('URL of the image to include with the reminder')
        .setRequired(false)),

  async execute(interaction) {
    try {
      const messageContent = interaction.options.getString('message').replace(/\\n/g, '\n'); 
      const day = interaction.options.getString('day').padStart(2, '0');
      const hour = interaction.options.getString('hour').padStart(2, '0');
      const minute = interaction.options.getString('minute').padStart(2, '0');
      const month = interaction.options.getString('month').padStart(2, '0');
      const year = interaction.options.getString('year');
      const imageUrl = interaction.options.getString('image-url');
      const channel = interaction.options.getChannel('channel');
      const guildId = interaction.guildId;
      const guildName = interaction.guild?.name;

      if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: 'Please select a valid text channel for the reminder.', ephemeral: true });
      }

      const dateStr = `${year}-${month}-${day}T${hour}:${minute}:00`;
      const date = parseISO(dateStr);

      if (!isValid(date) || !isFuture(date)) {
        return interaction.reply({ content: 'The provided date and time are invalid or in the past.', ephemeral: true });
      }

      // Cek apakah guild ada di database, jika tidak, buat entri baru
      const guildRecord = await db.guild.upsert({
        where: { guild_id: guildId },
        update: { guild_name: guildName },
        create: {
          guild_id: guildId,
          guild_name: guildName,
        },
      });

      // Masukkan pengingat ke tabel Reminder beserta data Time dan Message
      const reminderRecord = await db.reminder.create({
        data: {
          guild_id: guildRecord.guild_id,
          channel_id: channel.id,
          created_by: interaction.user.tag,
          time: {
            create: {
              day,
              month,
              year,
              hour,
              minute,
            },
          },
          message: {
            create: {
              content: messageContent,
              type: 'REMINDER',
              images_url: imageUrl || null,
            },
          },
        },
        include: {
          message: true,
          time: true,
        },
      });

      // Jadwalkan pengingat
      scheduleReminder(reminderRecord, interaction.client);

      const embed = new EmbedBuilder()
        .setTitle('Reminder Created Successfully!')
        .setDescription('Here are the details of the reminder you just created:')
        .addFields(
          { name: 'Message', value: messageContent, inline: false },
          { name: 'Date', value: `${day}/${month}/${year}`, inline: true },
          { name: 'Time', value: `${hour}:${minute}`, inline: true },
          { name: 'Channel', value: `${channel.name}`, inline: true }
        )
        .setColor('#00FF00')
        .setFooter({ text: 'Reminder created' })
        .setTimestamp();

      if (imageUrl) {
        embed.setImage(imageUrl);
      }

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
