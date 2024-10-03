import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';
import { getJson } from '../../helpers/HttpUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('minecraft-list')
    .setDescription('List all Minecraft servers for this guild')
    .setDMPermission(false),

  async execute(interaction) {
    const guildId = interaction.guildId;

    try {
      await interaction.deferReply();

      const minecraftServers = await db.minecraft.findMany({
        where: {
          guild_id: guildId
        }
      });

      if (minecraftServers.length === 0) {
        await interaction.editReply('No Minecraft servers found for this guild.');
        return;
      }

      const embeds = [];

      for (const server of minecraftServers) {
        const response = await getJson(`https://api.mcstatus.io/v2/status/java/${server.server_address}`);

        if (response.status !== 200 || !response.data) {
          await interaction.editReply(`Failed to fetch status for ${server.server_name}.`);
          continue;
        }

        const serverStatus = response.data;
        const isOnline = serverStatus?.online ? 'Yes' : 'No';
        const serverIcon = serverStatus?.favicon || null;
        const playerCount = serverStatus?.players?.online || 0;
        const maxPlayers = serverStatus?.players?.max || 0;
        const serverThumbnail = `https://eu.mc-api.net/v3/server/favicon/${server.server_address}`;

        const embed = new EmbedBuilder()
          .setColor(0x00AE86)
          .setTitle(`Minecraft Server: ${server.server_name}`)
          .setTimestamp()
          .setFooter({ text: 'Minecraft Server Management' })
          .setThumbnail(serverThumbnail)
          .addFields(
            { name: 'Server Name', value: server.server_name, inline: true },
            { name: 'Server Address', value: server.server_address, inline: true },
            { name: 'Description', value: server.server_description || 'No description provided', inline: false },
            { name: 'Version', value: server.server_version, inline: true },
            { name: 'Online', value: isOnline, inline: true },
            { name: 'Players', value: `${playerCount} / ${maxPlayers}`, inline: true },
            { name: 'Server Id', value: server.id, inline: false },
          );

        if (serverIcon) {
          embed.setThumbnail(serverIcon);
        }

        embeds.push(embed);
      }

      if (embeds.length > 0) {
        await interaction.editReply({ embeds });
      } else {
        await interaction.editReply('No valid Minecraft server data found.');
      }

    } catch (error) {
      console.error('Error fetching Minecraft server data:', error);
      await interaction.editReply('An error occurred while fetching the Minecraft server statuses.');
    }
  }
};
