import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../utlis/prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome-delete')
    .setDescription('Delete the current welcome message and channel setup')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  Name: "welcome-delete",
  Category: "SETUP",

  async execute(interaction) {
    try {
      const guildId = interaction.guildId;

      const welcomeData = await db.welcome.findUnique({
        where: { guild_id: guildId },
        include: { message: true } 
      });

      if (!welcomeData) {
        return interaction.reply({ content: 'No welcome message setup found for this server.', ephemeral: true });
      }

      await db.welcome.delete({
        where: { guild_id: guildId }
      });

      const otherUses = await db.welcome.count({
        where: { message_id: welcomeData.message_id }
      });

      if (otherUses === 0) {
        await db.message.delete({
          where: { message_id: welcomeData.message_id }
        });
      }

      return interaction.reply({ content: 'Welcome message and channel setup have been deleted successfully.', ephemeral: true });

    } catch (error) {
      console.error('Error deleting welcome message setup:', error);

      return interaction.reply({ content: 'There was an error while trying to delete the welcome message setup. Please try again later.', ephemeral: true });
    }
  },
};
