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

  /**
   * @param {import('discord.js').Interaction} interaction 
   */

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message') || 'Welcome {mention-member} to {server-name}';

    if (!channel) {
      return interaction.reply({ content: 'Please select a channel', ephemeral: true });
    }

    const formattedMessage = message.replace('{selected-channel}', `#${channel.name}`);
    
    const checkGuild = await db.guild.findUnique({
      where: { guild_id: interaction.guildId }
    });

    if (!checkGuild) {
      const createGuild = await db.guild.upsert({
        where: { guild_id: interaction.guildId },
        update: {},
        create: {
          guild_id: interaction.guildId,
          guild_name: interaction.guild.name
        }
      });
    }

    const createWelcome = await db.welcome.upsert({
      where: { guild_id: createGuild.guild_id },
      update: {
        channel_id: channel.id,
        custom_message: formattedMessage 
      },
      create: {
        guild_id: createGuild.guild_id,
        channel_id: channel.id,
        custom_message: formattedMessage
      }
    });

    return interaction.reply({ content: `Welcome message has been set to ${channel} with message: "${formattedMessage}"`, ephemeral: true });
  },
};
