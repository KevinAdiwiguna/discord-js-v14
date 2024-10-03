import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../utlis/prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('minecraft-delete')
    .setDescription('Delete the current Minecraft server setup')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('server-id')
        .setDescription('enter server id')
        .setRequired(true)),
  Name: "minecraft-delete",
  Category: "SETUP",

  async execute(interaction) {
    try {
      const getMinecraftId = await db.minecraft.findUnique({
        where: {
          id: interaction.options.getString('server-id')
        }
      })

      if (!getMinecraftId) {
        return interaction.reply({ content: 'No Minecraft server found with the provided ID.', ephemeral: true });
      }

      await db.minecraft.delete({
        where: { 
          id: interaction.options.getString('server-id')
         }
      });
      return interaction.reply({ content: 'Minecraft server deleted successfully.', ephemeral: true });
    } catch (error) {
      console.error('Error deleting Minecraft server:', error);
      return interaction.reply({ content: 'There was an error while trying to delete the Minecraft server setup.', ephemeral: true });
    }
  },
};
