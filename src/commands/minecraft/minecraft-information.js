const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minecraft-information')
    .setDescription('Show Minecraft server status'),

  async execute(interaction) {
    await interaction.deferReply();
    const getStatus = async () => {
      try {
        const getMinecraftBedrockData = await fetch(`https://api.mcstatus.io/v2/status/bedrock/${process.env.minecraft_bedrock_server}:${process.env.minecraft_bedrock_server}`)
        const getMinecraftJavaData = await fetch(`https://api.mcstatus.io/v2/status/java/${process.env.minecraft_java_server}`)

        const javaStatus = await getMinecraftJavaData.json()
        const bedrockStatus = await getMinecraftBedrockData.json()

        return {
          javaStatus,
          bedrockStatus
        }
      } catch (error) {
        console.error('Error fetching Minecraft server status:', error);
        return null;
      }
    };

    const miencraftStatus = await getStatus();

    const statusColor = (java, bedrock) => {
      if (!java && !bedrock) return 0xFF0000;
      if (!java || !bedrock) return 0xFFFF00;
      return '#00FF00';
    };

    console.log(miencraftStatus)

    const embed = new EmbedBuilder()
      .setColor(statusColor(miencraftStatus?.javaStatus?.online, miencraftStatus?.bedrockStatus?.online))
      .setTitle('Minecraft Server Status')
      .setDescription(`Minecraft main IP: ${miencraftStatus.javaStatus.host}`)
      .addFields(
        { name: "Online Players", value: `${!miencraftStatus?.javaStatus?.players?.online ? "0" : miencraftStatus?.javaStatus?.players?.online}/${!miencraftStatus?.javaStatus?.players?.max ? "0" : miencraftStatus?.javaStatus?.players?.max}` },
        { name: "Server Version", value: miencraftStatus?.javaStatus?.version?.name_clean || "unknown" },
        { name: "Server java status", value: miencraftStatus?.javaStatus?.version?.name_clean || "unknown" },
        { name: "Java status", value: `${miencraftStatus?.javaStatus?.online ? "online" : "offline"}` },
        { name: "Bedrock status", value: `${miencraftStatus?.bedrockStatus?.online ? "online" : "offline"}` },
      )
      .setThumbnail('https://i.ytimg.com/vi/0sSyz2KZEkE/oar2.jpg?sqp=-oaymwEiCMAEENAFSFqQAgHyq4qpAxEIARUAAAAAJQAAyEI9AICiQw==&rs=AOn4CLBLPtaR7nmIQJRDEni8_TgS-R-bzg')
      .setFooter({ text: process.env.minecraft_java_server, iconURL: 'https://static-00.iconduck.com/assets.00/minecraft-icon-2048x2048-3ifq7gy7.png' })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};
