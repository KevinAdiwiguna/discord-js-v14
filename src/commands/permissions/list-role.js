import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';
import config from '../../config.json' with { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('list-role')
    .setDescription('Mods command for list a role from the database'),
  async execute(interaction) {
    await interaction.deferReply();

    const getRoles = await db.roles.findMany({
      select: {
        roleId: true,
        roleName: true
      }
    });
    const roleIds = getRoles.map(role => role.roleId.replace(/<@&|>/g, ''));
    if (!getRoles.length) {
      console.warn("No roles found in the database");
    }

    const admin = config.admin;
    const userId = interaction.user.id;

    // console.log(`Role IDs from database: ${roleIds}`);
    // const userRoles = interaction.member.roles.cache.map(role => role.id);
    // console.log(`User's roles: ${userRoles}`);

    const userHasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));
    // console.log(`User has required role: ${userHasRole}`);

    const hasPermission = admin.includes(userId) || userHasRole;

    if (!hasPermission) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Permission Denied')
        .setDescription('You do not have permission to use this command.');
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    try {
      const rolesList = getRoles.map(role => `${role.roleName} (${role.roleId})`).join('\n');
      const adminList = admin.map(adminId => `<@${adminId}>`).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Roles List')
        .setDescription(rolesList || 'No roles found in the database.')
        .addFields(
          { name: 'Admin Users', value: adminList || 'No admin users found.' }
        );
      
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error')
        .setDescription('An error occurred while retrieving the roles from the database.');
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }


  }
}