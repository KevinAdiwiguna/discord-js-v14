const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minecraft-ping')
		.setDescription('Send ping to minecrft server'),
	async execute(interaction) {
		console.log(interaction);
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
		const ping = sent.createdTimestamp - interaction.createdTimestamp;

		const getColor = (ping) => {
			if (ping > 1000) return 0xFF0000;
			if (ping > 500) return 0xFFFF00;
			return 0x00FF00;
		};

		const embed = new EmbedBuilder()
			.setColor(getColor(ping))
			.setTitle('Minecraft Ping')
			.setDescription(`Ping kamu ke server Minecraft: ${ping}ms`)
			.setThumbnail('https://static-00.iconduck.com/assets.00/minecraft-icon-2048x2048-3ifq7gy7.png')
			.setFooter({ text: process.env.minecraft_java_server, iconURL: 'https://i.ytimg.com/vi/0sSyz2KZEkE/oar2.jpg?sqp=-oaymwEiCMAEENAFSFqQAgHyq4qpAxEIARUAAAAAJQAAyEI9AICiQw==&rs=AOn4CLBLPtaR7nmIQJRDEni8_TgS-R-bzg' })
			.setTimestamp();

		await interaction.editReply({ content: '', embeds: [embed] });
	},
};
