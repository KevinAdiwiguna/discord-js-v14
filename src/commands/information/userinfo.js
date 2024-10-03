import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('user information')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to get the information of')
        .setRequired(true)),
  Name: "userinfo",
  Category: "INFORMATION",

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: "User not found in this guild.", ephemeral: true });
    }

    const joinDate = member.joinedAt.toDateString();
    const userAvatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const userName = user.username;
    const userTag = user.tag;
    const userCreatedAt = user.createdAt.toDateString();
    const userRoles = member.roles.cache.map(role => role.toString()).join(', ') || 'None';
    const userHighestRole = member.roles.highest.toString();
    const userNickname = member.nickname || 'None';
    const userBoosted = member.premiumSince ? member.premiumSince.toDateString() : 'Not Boosted';

    const embed = new EmbedBuilder()
      .setTitle(`${userName}'s Information`)
      .setThumbnail(userAvatar)
      .setColor(0x00ff00)
      .addFields(
        { name: 'User Tag', value: userTag, inline: true },
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Created', value: userCreatedAt, inline: true },
        { name: 'Joined Server', value: joinDate, inline: true },
        { name: 'Nickname', value: userNickname, inline: true },
        { name: 'Roles', value: userRoles, inline: false },  // Jika role banyak, tampilkan tidak inline
        { name: 'Highest Role', value: userHighestRole, inline: true },
        { name: 'Server Booster', value: userBoosted, inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}