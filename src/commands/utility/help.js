import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import fs from 'fs'
import path from 'path';
import url from 'url'
import config from '../../config.json' with { type: "json" };


export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List of all bot's commands."),

  async execute(interaction) {
    const commandFolders = fs.readdirSync('./src/commands').filter(folder => !folder.startsWith('.'));
    const commandsByCategory = {};

    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
      const commands = [];

      for (const file of commandFiles) {
        const filePath = path.resolve(`./src/commands/${folder}/${file}`);
        const fileUrl = url.pathToFileURL(filePath);
        const { default: command } = await import(fileUrl.href);
        commands.push({ name: command.data.name, description: command.data.description });
      }
      commandsByCategory[folder] = commands;
    }

    const dropdownOptions = Object.keys(commandsByCategory).map(folder => ({
      label: folder,
      value: folder
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('category-select')
      .setPlaceholder("Select a Category")
      .addOptions(dropdownOptions);

    const embed = new EmbedBuilder()
      .setTitle("Help menu")
      .setDescription("Select a category from the dropdown menu to view commands")
      .setImage(`${config.thumbnail_url}`)
      .setFooter({ text: `develop by ${config.developer}` })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });

    const filter = i => i.isStringSelectMenu() && i.customId === 'category-select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      const selectedCategory = i.values[0];
      const categoryCommands = commandsByCategory[selectedCategory];

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`${selectedCategory} Commands`)
        .setDescription("List of all commands in this category")
        .setImage(`${config.thumbnail_url}`)
        .addFields(categoryCommands.map(command => ({
          name: command.name,
          value: command.description
        })));

      await i.update({ embeds: [categoryEmbed], components: [row] });
    });

    collector.on('end', collected => {
      console.log(`Collected ${collected.size} interactions.`);
    });
  }
};
