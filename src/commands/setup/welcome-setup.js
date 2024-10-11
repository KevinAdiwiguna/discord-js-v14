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
        .setRequired(false))

    .addStringOption(option =>
      option.setName('images-url')
        .setDescription('URL to the image')
        .setRequired(false)),


  Name: "welcome-setup",
  Category: "SETUP",

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || 'Welcome {mention-member} to {server-name}';
      const imageUrl = interaction.options.getString('images-url');

      if (!channel) {
        return interaction.reply({ content: 'Please select a channel', ephemeral: true });
      }

      const formattedMessage = message.replace('{selected-channel}', `#${channel.name}`);

      const existingWelcome = await db.welcome.findUnique({
        where: { guild_id: interaction.guildId }
      });

      if (existingWelcome) {
        const updatedWelcome = await db.welcome.update({
          where: { guild_id: interaction.guildId },
          data: {
            channel_id: channel.id,
            message: {
              update: {
                content: formattedMessage
              }
            },
            images_url: imageUrl || null,
          }
        });


        return interaction.reply({
          content: `Welcome message has been updated to ${channel} with message: "${formattedMessage}"`,
          ephemeral: true
        });

      } else {
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

        const messageRecord = await db.message.create({
          data: {
            content: formattedMessage,
            type: 'WELCOME',
          }
        });

        const createWelcome = await db.welcome.create({
          data: {
            guild_id: guildRecord.guild_id,
            channel_id: channel.id,
            message_id: messageRecord.message_id,
            images_url: imageUrl || null,
          }
        });

        return interaction.reply({
          content: `Welcome message has been set to ${channel} with message: "${formattedMessage}"`,
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('Error setting up welcome message:', error);
      return interaction.reply({
        content: 'There was an error while setting up the welcome message. Please try again later.',
        ephemeral: true
      });
    }
  },
};
