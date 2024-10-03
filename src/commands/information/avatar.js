import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('get the avatar of a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to get the avatar of')
        .setRequired(true)),
  Name: "avatar",
  Category: "INFORMATION",

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.reply(user.displayAvatarURL({ dynamic: true, size: 4096 }));
  }
}