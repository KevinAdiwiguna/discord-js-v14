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
      // Tunda balasan agar bisa melakukan pemrosesan
      await interaction.deferReply();

      // Ambil daftar server Minecraft yang terkait dengan guild ini
      const minecraftServers = await db.minecraft.findMany({
        where: { guild_id: guildId }
      });

      if (minecraftServers.length === 0) {
        await interaction.editReply('No Minecraft servers found for this guild.');
        return;
      }

      const embeds = [];

      for (const server of minecraftServers) {
        try {
          // Mengambil status dari API server Minecraft eksternal
          const response = await getJson(`https://api.mcstatus.io/v2/status/java/${server.server_address}`);

          if (response.status !== 200 || !response.data) {
            // Tangani jika gagal mengambil status server tertentu
            await interaction.followUp(`Failed to fetch status for ${server.server_name}.`);
            continue;
          }

          const serverStatus = response.data;
          const isOnline = serverStatus?.online ? 'Yes' : 'No';
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
              { name: 'Version', value: server.server_version || 'Unknown', inline: true },
              { name: 'Online', value: isOnline, inline: true },
              { name: 'Players', value: `${playerCount} / ${maxPlayers}`, inline: true },
              { name: 'Server Id', value: server.id, inline: false }
            );

          if (serverStatus?.favicon) {
            embed.setThumbnail(serverStatus.favicon);
          }

          embeds.push(embed);
        } catch (serverError) {
          console.error(`Error fetching status for server ${server.server_name}:`, serverError);
          await interaction.followUp(`Error fetching status for server: ${server.server_name}.`);
        }
      }

      if (embeds.length > 0) {
        await interaction.editReply({ embeds });
      } else {
        await interaction.editReply('No valid Minecraft server data found.');
      }

    } catch (error) {
      // Tangani jika ada kesalahan pada saat mengambil daftar server atau lainnya
      console.error('Error fetching Minecraft server data:', error);
      await interaction.editReply('An error occurred while fetching the Minecraft server statuses.');
    }
  }
};
