const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(interaction) {
    const channel = interaction.guild.channels.cache.find(ch => ch.name === '╭╴🌱﹢welcome﹢★');
    
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Welcome to the Server!')
      .setDescription(`Selamat datang di server Hoshi, <@${interaction.id}>! Pastikan untuk memeriksa <#1225294450448928770> dan <#1243401595115405352>`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'We hope you have a great time here!' });

    channel.send({ embeds: [welcomeEmbed] });
  },
};
