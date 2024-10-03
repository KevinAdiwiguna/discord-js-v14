import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getJson } from '../../helpers/HttpUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('github')
    .addStringOption(option =>
      option.setName('github_user')
        .setDescription('The github user you want to search for')
        .setRequired(true))
    .setDescription('shows github statistics of a user'),
  Name: "Github",
  Category: "UTILITY",

  async execute(interaction) {
    const target = interaction.options.getString('github_user');
    const author = interaction.user;

    async function getGithubUser(target, author) {
      const response = await getJson('https://api.github.com/users/' + target);
      if (response?.status === 404) {
        return interaction.reply({ content: "User not found", ephemeral: true })
      }

      const json = await response?.data
      const {
        login: username,
        name,
        id: githubId,
        avatar_url: avatarUrl,
        html_url: userPageLink,
        followers,
        following,
        bio,
        location,
        blog,
        public_repos: publicRepos
      } = json;

      const messageEmbed = new EmbedBuilder()
        .setAuthor({
          name: name || username,
          url: userPageLink,
          iconURL: avatarUrl,
        })
        .setThumbnail(avatarUrl)
        .setDescription(`**Bio**: ${bio || "Not Provided"}\n**Location**: ${location || "Not Provided"}`)
        .addFields(
          { name: 'Username', value: `[${username}](${userPageLink})`, inline: true },
          { name: 'Followers', value: followers.toString(), inline: true },
          { name: 'Following', value: following.toString(), inline: true },
          { name: 'Public Repositories', value: publicRepos.toString(), inline: true },
          { name: 'Blog', value: blog ? `[Visit Blog](${blog})` : "Not Provided", inline: true },
          { name: 'GitHub ID', value: githubId.toString(), inline: true }
        )
        .setColor(0x6e5494)
        .setFooter({ text: `Requested by ${author.username}`, iconURL: author.displayAvatarURL() })
        .setTimestamp();

      interaction.reply({ embeds: [messageEmbed] });
    }
    await getGithubUser(target, author);
  }
};