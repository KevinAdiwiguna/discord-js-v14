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

      // Upsert guild ke dalam database (jika belum ada, maka akan dibuat)
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

      // Upsert welcome message setup
      const createWelcome = await db.welcome.upsert({
        where: { guild_id: guildRecord.guild_id },
        update: {
          channel_id: channel.id,
          message_id: messageRecord.message_id,
        },
        create: {
          guild_id: guildRecord.guild_id,
          channel_id: channel.id,
          message_id: messageRecord.message_id,
        }
      });

      // Berikan tanggapan bahwa setup sudah berhasil
      return interaction.reply({ 
        content: `Welcome message has been set to ${channel} with message: "${formattedMessage}"`, 
        ephemeral: true 
      });
    
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
