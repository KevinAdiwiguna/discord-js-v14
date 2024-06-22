import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config.json' with { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName('minecraft-ping')
		.setDescription('Check ping to Minecraft server'),

	async execute(interaction) {
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
			.setDescription(`Your ping to the Minecraft server: ${ping}ms`)
			.setThumbnail(config.minecraft_img_url)
			.setFooter({ text: `develop by ${config.developer}`, iconURL: config.thumbnail_url })
			.setTimestamp();

		await interaction.editReply({ content: '', embeds: [embed] });
	},
};
