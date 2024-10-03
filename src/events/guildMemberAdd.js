import { Events, EmbedBuilder } from 'discord.js';
import { db } from '../utlis/prisma.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const guildId = member.guild.id;
      
      const guild = await db.guild.findUnique({
        where: { guild_id: guildId }
      });
      if (!guild) return;

      const welcome = await db.welcome.findUnique({
        where: { guild_id: guild.guild_id }
      });
      if (!welcome) return;

      const channel = await member.guild.channels.cache.get(welcome.channel_id);
      if (!channel) return;

      const message = welcome.custom_message
        .replace('{mention-member}', `<@${member.id}>`)
        .replace('{username}', `**${member.user.username}**`)
        .replace('{server-name}', member.guild.name)
        .replace('{selected-channel}', `#${channel.name}`); 
      const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor('#0099ff')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) 
        .setFooter({ text: `Joined on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }
};
