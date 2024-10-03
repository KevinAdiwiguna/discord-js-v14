import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the bot latency'),
  Name: "ping",
  Category: "INFORMATION",

  async execute(interaction) {
    await interaction.reply(`🏓 Pong : \`${Math.floor(interaction.client.ws.ping)}ms\``);
  }
}