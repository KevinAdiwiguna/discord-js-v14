import { Events, EmbedBuilder } from 'discord.js';
import { db } from '../utlis/prisma.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const guildId = member.guild.id;

      const welcomeData = await db.welcome.findUnique({
        where: { guild_id: guildId },
        include: {
          guild: true,
          message: true
        }
      });

      if (!welcomeData) return;

      let channel = member.guild.channels.cache.get(welcomeData.channel_id);
      if (!channel) {
        channel = await member.guild.channels.fetch(welcomeData.channel_id).catch(() => null);
      }
      if (!channel) return;

      const message = welcomeData.message.content
        .replace('{mention-member}', `<@${member.id}>`)
        .replace('{username}', `**${member.user.username}**`)
        .replace('{server-name}', member.guild.name)
        .replace('{selected-channel}', `#${channel.name}`);

      const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor('#0099ff')
        .setFooter({ text: `Joined on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` })
        .setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 1024 })) // Add user avatar as thumbnail
        .setTimestamp();

      const imageUrl = welcomeData.message.images_url;

      if (imageUrl) {
        await channel.send({ embeds: [embed], files: [{ attachment: imageUrl, name: 'welcome-image.png' }] });
      } else {
        await channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }
};
