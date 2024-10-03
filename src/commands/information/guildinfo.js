import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('guildinfo')
    .setDescription('Shows the guild information'),
  Name: "guildinfo",
  Category: "INFORMATION",

  async execute(interaction) {
    const guild = interaction.guild;
    const members = guild.memberCount;
    const owner = await guild.fetchOwner(); 
    const createdAt = guild.createdAt.toDateString(); 
    const iconURL = guild.iconURL({ dynamic: true, size: 4096 }) ;
    const guildName = guild.name;

    const validIconURL = iconURL || interaction.client.user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Guild Information')
      .addFields(
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Members', value: members.toString(), inline: true },
        { name: 'Created At', value: createdAt, inline: true },
        { name: 'Guild Name', value: guildName, inline: true }, 
      )
      .setThumbnail(validIconURL)
      .setTimestamp()
      .setFooter({ text: `ID: ${guild.id}` });

    await interaction.reply({ embeds: [embed] });
  }
}