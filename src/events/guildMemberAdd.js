import { Events, EmbedBuilder } from 'discord.js'
import config from '../config.json' with { type: "json" };

export default {
  name: Events.GuildMemberAdd,
  async execute(interaction) {
    const channel = interaction.guild.channels.cache.find(ch => ch.name === config.welcome_channel);

    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Welcome to the Server!')
      .setDescription(`Selamat datang di server ${config.server_name}, <@${interaction.id}>! Pastikan untuk memeriksa ${config.rules_channel} dan ${config.self_role_channel}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `${config.developer}` });

    channel.send({ embeds: [welcomeEmbed] });
  },
};
