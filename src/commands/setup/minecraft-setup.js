import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../utlis/prisma.js'; // Assuming you have this configured correctly

export default {
  data: new SlashCommandBuilder()
    .setName('minecraft-setup')
    .setDescription('Setup minecraft server')
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
    .addStringOption(option =>
      option.setName('server-version')
        .setDescription('Enter the server version')
        .setRequired(true))
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
    const serverDescription = interaction.options.getString('server-description') || 'No description provided'; // Optional
    const serverVersion = interaction.options.getString('server-version');

    try {
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

      const existingMinecraftServer = await db.minecraft.findUnique({
        where: {
          guild_id_server_name: {
            guild_id: guildId,
            server_name: serverName,
          },
          server_address: serverAddress,
        }
      });

      if (existingMinecraftServer) {
        await interaction.reply('Minecraft server already exists with the same name or address. please try again with different name or address. or delete the existing server.');
      } else {
        await db.minecraft.create({
          data: {
            guild_id: guildId,
            server_name: serverName,
            server_address: serverAddress,
            server_description: serverDescription,
            server_version: serverVersion
          }
        });
        await interaction.reply(`Minecraft server setup complete: \nName: ${serverName}\nAddress: ${serverAddress}\nDescription: ${serverDescription}\nVersion: ${serverVersion}`);
      }
    } catch (error) {
      console.error('Error saving Minecraft server data:', error);
      await interaction.reply('An error occurred while setting up the Minecraft server.');
    }
  }
};
