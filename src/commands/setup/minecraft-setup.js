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
    const serverDescription = interaction.options.getString('server-description') || 'No description provided';
    const serverVersion = interaction.options.getString('server-version');

    try {
      // Step 1: Check if the guild exists, if not, create it
      const guildRecord = await db.guild.upsert({
        where: { guild_id: guildId },
        update: {}, // Only ensuring the guild exists, no updates
        create: {
          guild_id: guildId,
          guild_name: interaction.guild.name
        }
      });

      // Step 2: Check if a Minecraft server with the same name or address exists
      const existingMinecraftServer = await db.minecraft.findFirst({
        where: {
          guild_id: guildId,
          OR: [
            { server_name: serverName },
            { server_address: serverAddress }
          ]
        }
      });

      if (existingMinecraftServer) {
        return interaction.reply({
          content: 'Minecraft server with the same name or address already exists. Please try again with a different name or address, or delete the existing server.',
          ephemeral: true
        });
      }

      // Step 3: Create the new Minecraft server record
      await db.minecraft.create({
        data: {
          guild_id: guildId,
          server_name: serverName,
          server_address: serverAddress,
          server_description: serverDescription,
          server_version: serverVersion
        }
      });

      // Step 4: Send a success embed message
      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('Minecraft Server Setup Complete')
        .addFields(
          { name: 'Server Name', value: serverName, inline: true },
          { name: 'Server Address', value: serverAddress, inline: true },
          { name: 'Description', value: serverDescription, inline: false },
          { name: 'Version', value: serverVersion, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Minecraft Server Management' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      // Step 5: Handle any errors
      console.error('Error saving Minecraft server data:', error);
      await interaction.reply({ 
        content: 'An error occurred while setting up the Minecraft server. Please try again later.', 
        ephemeral: true 
      });
    }
  }
};
