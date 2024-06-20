const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('minecraft-server')
		.setDescription('Show Minecraft server domain'),

	async execute(interaction) {
		await interaction.deferReply();
		const embed = new EmbedBuilder()
			.setColor(0x00FF00)
			.setTitle('Minecraft Server List')
			.setDescription('List of Minecraft servers')
			.addFields(
				{ name: "Java IP", value: config.java_ip },
				{ name: "Bedrock IP", value: config.bedrock_ip},
				{ name: "Bedrock Port", value: config.bedrock_port},
				{ name: "Minecraft version", value: process.env.minecraft_version},
			)
			.setThumbnail('https://static-00.iconduck.com/assets.00/minecraft-icon-2048x2048-3ifq7gy7.png')
			.setFooter({ text: `${process.env.minecraft_java_server}`, iconURL: 'https://i.ytimg.com/vi/0sSyz2KZEkE/oar2.jpg?sqp=-oaymwEiCMAEENAFSFqQAgHyq4qpAxEIARUAAAAAJQAAyEI9AICiQw==&rs=AOn4CLBLPtaR7nmIQJRDEni8_TgS-R-bzg' })

			.setTimestamp();

		await interaction.editReply({ content: '', embeds: [embed] });
	},
};
