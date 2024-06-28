import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../config.json' with { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName('minecraft-server')
		.setDescription('Show Minecraft server details'),

	async execute(interaction) {
		await interaction.deferReply();

		const embed = new EmbedBuilder()
			.setColor(0x00FF00)
			.setTitle('Minecraft Server List')
			.setDescription('List of Minecraft servers')
			.addFields(
				{ name: "Java IP", value: process.env.MINECRAFT_JAVA_DOMAIN },
				// { name: "Bedrock IP", value: process.env.MINECRAFT_BEDROCK_IP },
				// { name: "Bedrock Port", value: process.env.MINECRAFT_BEDROCK_PORT },
				{ name: "Minecraft Version", value: process.env.MINECRAFT_VERSION }
			)
			.setImage(config.minecraft_img_url)
			.setFooter({ text: `develop by ${config.developer}`, iconURL: config.thumbnail_url })
			.setTimestamp();

		await interaction.editReply({ embeds: [embed] });
	},
};
