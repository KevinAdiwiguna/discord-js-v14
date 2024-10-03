import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('flip')
    .setDescription('coin flip game (Garuda / Angklung)'),
  Name: "flip",
  Category: "FUN",

  async execute(interaction) {
    const outcomes = ['Garuda', 'Angklung'];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    const embed = new EmbedBuilder()
      .setTitle('🪙 Coin Flip!')
      .setDescription(`The result is **${randomOutcome}**!`)
      .setColor(randomOutcome === 'Heads' ? '#FFD700' : '#C0C0C0')
      .setThumbnail(randomOutcome === 'Garuda'
        ? 'https://awsimages.detik.net.id/content/2010/07/20/5/Seribulogam-luar.jpg'
        : 'https://i.colnect.net/f/957/018/1000_Rupiah_Angklung.jpg'
      )
      .setFooter({ text: `Flipped by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}