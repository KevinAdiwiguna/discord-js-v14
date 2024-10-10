import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { db } from '../../utlis/prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome-setup')
    .setDescription('Setup welcome message and channel')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select the channel')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true))

    .addStringOption(option =>
      option.setName('message')
        .setDescription('TEMPLATE: {mention-member} {username} {server-name}')
        .setRequired(false)),

  Name: "welcome-setup",
  Category: "SETUP",

  async execute(interaction) {
    try {
      // Ambil channel dan pesan dari opsi yang disediakan oleh pengguna
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || 'Welcome {mention-member} to {server-name}';

      if (!channel) {
        return interaction.reply({ content: 'Please select a channel', ephemeral: true });
      }

      // Format pesan sambutan dengan data channel yang dipilih
      const formattedMessage = message.replace('{selected-channel}', `#${channel.name}`);

      // Cek apakah guild sudah memiliki pengaturan welcome message sebelumnya
      const existingWelcome = await db.welcome.findUnique({
        where: { guild_id: interaction.guildId }
      });

      // Jika welcome message sebelumnya sudah ada, kita hanya melakukan update
      if (existingWelcome) {
        // Update message dan channel_id pada pengaturan yang ada
        const updatedWelcome = await db.welcome.update({
          where: { guild_id: interaction.guildId },
          data: {
            channel_id: channel.id,
            message: {
              update: {
                content: formattedMessage
              }
            }
          }
        });

        // Tanggapan bahwa setup sudah diperbarui
        return interaction.reply({ 
          content: `Welcome message has been updated to ${channel} with message: "${formattedMessage}"`, 
          ephemeral: true 
        });

      } else {
        // Jika belum ada, buat entry baru untuk welcome message
        const guildRecord = await db.guild.upsert({
          where: { guild_id: interaction.guildId },
          update: {
            guild_name: interaction.guild.name,
          },
          create: {
            guild_id: interaction.guildId,
            guild_name: interaction.guild.name,
          }
        });

        // Buat pesan sambutan baru di database
        const messageRecord = await db.message.create({
          data: {
            content: formattedMessage,
            type: 'WELCOME',
          }
        });

        // Buat welcome message setup baru
        const createWelcome = await db.welcome.create({
          data: {
            guild_id: guildRecord.guild_id,
            channel_id: channel.id,
            message_id: messageRecord.message_id,
          }
        });

        // Tanggapan bahwa setup berhasil dibuat
        return interaction.reply({ 
          content: `Welcome message has been set to ${channel} with message: "${formattedMessage}"`, 
          ephemeral: true 
        });
      }

    } catch (error) {
      // Log kesalahan untuk debugging
      console.error('Error setting up welcome message:', error);

      // Kirim pesan error ke pengguna
      return interaction.reply({ 
        content: 'There was an error while setting up the welcome message. Please try again later.', 
        ephemeral: true 
      });
    }
  },
};
