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
        .setDescription('Enter the Minecraft server ID to delete')
        .setRequired(true)),
  
  Name: "minecraft-delete",
  Category: "SETUP",

  async execute(interaction) {
    try {
      // Ambil server ID dari input pengguna
      const serverId = interaction.options.getString('server-id');
      
      // Cek apakah server Minecraft dengan ID tersebut ada di database
      const minecraftServer = await db.minecraft.findUnique({
        where: { id: serverId }
      });

      // Jika server tidak ditemukan, kirimkan pesan kepada pengguna
      if (!minecraftServer) {
        return interaction.reply({ 
          content: 'No Minecraft server found with the provided ID.', 
          ephemeral: true 
        });
      }

      // Jika ditemukan, hapus server Minecraft dari database
      await db.minecraft.delete({
        where: { id: serverId }
      });

      // Berikan tanggapan sukses setelah penghapusan
      return interaction.reply({ 
        content: 'Minecraft server deleted successfully.', 
        ephemeral: true 
      });

    } catch (error) {
      // Tangani kesalahan dan log error ke konsol untuk debugging
      console.error('Error deleting Minecraft server:', error);

      // Kirim pesan kesalahan kepada pengguna
      return interaction.reply({ 
        content: 'There was an error while trying to delete the Minecraft server setup. Please try again later.', 
        ephemeral: true 
      });
    }
  },
};
