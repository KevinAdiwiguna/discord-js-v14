import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import config from '../../config.json' with { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName('minecraft-information')
    .setDescription('Show Minecraft server status'),

  async execute(interaction) {
    await interaction.deferReply();

    const getStatus = async () => {
      try {
        // const getMinecraftBedrockData = await fetch(`https://api.mcstatus.io/v2/status/bedrock/${process.env.MINECRAFT_BEDROCK_IP}:${process.env.MINECRAFT_BEDROCK_PORT}`);
        const getMinecraftJavaData = await fetch(`https://api.mcstatus.io/v2/status/java/${process.env.MINECRAFT_IP}`);

        const javaStatus = await getMinecraftJavaData.json();
        // const bedrockStatus = await getMinecraftBedrockData.json();

        return {
          javaStatus,
          // bedrockStatus
        };
      } catch (error) {
        console.error('Error fetching Minecraft server status:', error);
        return null;
      }
    };

    const minecraftStatus = await getStatus();

    // const statusColor = (java, bedrock) => {
    //   if (!java || !java.online || !bedrock || !bedrock.online) return '#FF0000'; // Red if either server is offline
    //   return '#00FF00'; // Green if both servers are online
    // };
    const statusColor = (java) => {
      if (!java || !java.online) return '#FF0000'; // Red if either server is offline
      return '#00FF00'; // Green if both servers are online
    };

    const embed = new EmbedBuilder()
      // .setColor(statusColor(minecraftStatus?.javaStatus, minecraftStatus?.bedrockStatus))
      .setColor(statusColor(minecraftStatus?.javaStatus))
      .setTitle('Minecraft Server Status')
      .setDescription(`Minecraft main IP: ${process.env.MINECRAFT_JAVA_DOMAIN || "Server not active"}`)
      .addFields(
        { name: "Online Players", value: `${minecraftStatus?.javaStatus?.players?.online || 0}/${minecraftStatus?.javaStatus?.players?.max || 0}` },
        { name: "Server Version", value: minecraftStatus?.javaStatus?.version?.name_clean || "Unknown" },
        { name: "Server Status", value: `${minecraftStatus?.javaStatus?.online ? "Online" : "Offline"}` },
        // { name: "Bedrock Status", value: `${minecraftStatus?.bedrockStatus?.online ? "Online" : "Offline"}` }
      )
      .setImage(config.minecraft_img_url)
      .setFooter({ text: `develop by ${config.developer}`, iconURL: config.thumbnail_url })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
