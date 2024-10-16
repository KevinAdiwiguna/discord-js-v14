import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('minecraft-setup')
    .setDescription('Setup Minecraft server')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('server-name')
        .setDescription('Enter the server name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('server-address')
        .setDescription('Enter the server address')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('server-port')
        .setDescription('Enter the server port')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('server-type')
        .setDescription('Select the server type')
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'JAVA' },
          { name: 'Bedrock', value: 'BEDROCK' }
        ))
    .addStringOption(option =>
      option.setName('server-description')
        .setDescription('Enter the server description')
        .setRequired(false)),

  Name: "minecraft-setup",
  Category: "SETUP",

  async execute(interaction) {
    const guildId = interaction.guildId;
    const serverName = interaction.options.getString('server-name');
    const serverAddress = interaction.options.getString('server-address');
    const serverPort = interaction.options.getInteger('server-port');
    const serverDescription = interaction.options.getString('server-description') || 'No description provided';
    const serverType = interaction.options.getString('server-type');

    try {
      const guildRecord = await db.guild.upsert({
        where: { guild_id: guildId },
        update: {},
        create: {
          guild_id: guildId,
          guild_name: interaction.guild.name
        }
      });

      const existingMinecraftServer = await db.minecraft.findFirst({
        where: {
          guild_id: guildId,
          OR: [
            { server_name: serverName },
            {
              server_address: serverAddress,
              server_port: serverPort
            }
          ]
        }
      });

      if (existingMinecraftServer) {
        return interaction.reply({
          content: 'A Minecraft server with the same name, address, or port already exists. Please try again with a different name, address, or port, or delete the existing server.',
          ephemeral: true
        });
      }

      await db.minecraft.create({
        data: {
          guild_id: guildId,
          server_name: serverName,
          server_address: serverAddress,
          server_port: serverPort,
          server_description: serverDescription,
          server_type: serverType
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('Minecraft Server Setup Complete')
        .addFields(
          { name: 'Server Name', value: serverName || 'N/A', inline: true },
          { name: 'Server Address', value: `${serverAddress}:${serverPort}` || 'N/A', inline: true },
          { name: 'Description', value: serverDescription || 'No description provided', inline: false },
          { name: 'Type', value: serverType || 'N/A', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Minecraft Server Management' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error saving Minecraft server data:', error);
      await interaction.reply({
        content: 'An error occurred while setting up the Minecraft server. Please try again later.',
        ephemeral: true
      });
    }
  }
};
