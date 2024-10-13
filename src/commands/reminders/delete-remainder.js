import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../utlis/prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('delete-remainder')
    .setDescription('Delete a remainder by its ID')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The ID of the remainder to delete')
        .setRequired(true)), 
  
  Name: "delete-remainder",
  Category: "REMAINDERS",

  async execute(interaction) {
    try {
      const reminderId = interaction.options.getString('id'); 

      const reminder = await db.reminder.findUnique({
        where: { reminder_id: reminderId }
      });

      if (!reminder) {
        return interaction.reply({ content: 'Reminder not found. Please check the ID and try again.', ephemeral: true });
      }

      const { message_id, time_id } = reminder;

      await db.reminder.delete({
        where: { reminder_id: reminderId }
      });

      const otherRemindersWithMessage = await db.reminder.findMany({
        where: { message_id: message_id }
      });

      if (otherRemindersWithMessage.length === 0) {
        await db.message.delete({
          where: { message_id: message_id }
        });
      }

      const otherRemindersWithTime = await db.reminder.findMany({
        where: { time_id: time_id }
      });

      if (otherRemindersWithTime.length === 0) {
        await db.time.delete({
          where: { time_id: time_id }
        });
      }

      return interaction.reply({ content: `Reminder with ID \`${reminderId}\` has been successfully deleted.`, ephemeral: true });

    } catch (error) {
      console.error('Error deleting reminder:', error);
      return interaction.reply({
        content: 'There was an error while trying to delete the reminder. Please try again later.',
        ephemeral: true
      });
    }
  }
};
