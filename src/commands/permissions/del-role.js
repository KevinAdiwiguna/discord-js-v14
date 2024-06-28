import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';
import config from '../../config.json' with { type: 'json' };



export default {
  data: new SlashCommandBuilder()
    .setName('del-role')
    .setDescription('Mods command for deleting a role from the database')
    .addStringOption(option =>
      option.setName('role')
        .setDescription('Tag role to delete')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const getRoles = await db.roles.findMany({
      select: {
        roleId: true
      }
    });

    const roleIds = getRoles.map(role => role.roleId.replace(/<@&|>/g, ''));

    if (!getRoles.length) {
      console.warn("No roles found in the database");
    }
    
    // console.log(`Role IDs from database: ${roleIds}`);
    // const userRoles = interaction.member.roles.cache.map(role => role.id);
    // console.log(`User's roles: ${userRoles}`);

    const userHasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));
    // console.log(`User has required role: ${userHasRole}`);

    const admin = config.admin;
    const userId = interaction.user.id;
    const hasPermission = admin.includes(userId) || userHasRole;

    if (!hasPermission) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Permission Denied')
        .setDescription('You do not have permission to use this command.');
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    const role = interaction.options.getString('role');
    try {
      const existingRole = await db.roles.findFirst({
        where: {
          roleId: role,
        },
      });

      if (!existingRole) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('Role Not Found')
          .setDescription(`Role does not exist: ${role}`);
        return interaction.editReply({ embeds: [embed] });
      }

      await db.roles.delete({
        where: {
          roleId: role,
        },
      });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Role Deleted')
        .setDescription(`Successfully deleted from DB: ${role}`);
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error')
        .setDescription('An error occurred while deleting the role from the database.');
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
  },
};
