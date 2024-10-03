import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('shows the bot uptime'),
  Name: "uptime",
  Category: "INFORMATION",

  async execute(interaction) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime) % 60;

    await interaction.reply(`🕰️ Uptime: \`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds\``);
  }
}