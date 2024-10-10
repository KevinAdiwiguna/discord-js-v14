import { Events, EmbedBuilder } from 'discord.js';
import { db } from '../utlis/prisma.js';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp'; // Menggunakan sharp untuk konversi gambar
import { getJson } from '../helpers/HttpUtils.js'; // Menggunakan fungsi getJson Anda

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const guildId = member.guild.id;

      // Cari data guild dan welcome message secara bersamaan
      const welcomeData = await db.welcome.findUnique({
        where: { guild_id: guildId },
        include: {
          guild: true, // Ambil relasi guild jika diperlukan
          message: true // Ambil pesan terkait
        }
      });

      if (!welcomeData) return;

      // Coba ambil channel dari cache, jika tidak ada di cache, gunakan fetch
      let channel = member.guild.channels.cache.get(welcomeData.channel_id);
      if (!channel) {
        channel = await member.guild.channels.fetch(welcomeData.channel_id).catch(() => null);
      }
      if (!channel) return;

      // Ambil pesan dari database dan lakukan replace placeholder
      const message = welcomeData.message.content
        .replace('{mention-member}', `<@${member.id}>`)
        .replace('{username}', `**${member.user.username}**`)
        .replace('{server-name}', member.guild.name)
        .replace('{selected-channel}', `#${channel.name}`);

      // Buat gambar sambutan menggunakan Canvas dengan latar belakang dari URL
      const welcomeImage = await generateWelcomeImage(member);

      // Buat embed dengan pesan sambutan dan tambahkan thumbnail avatar pengguna
      const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor('#0099ff')
        .setFooter({ text: `Joined on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` })
        .setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 1024 })) // Tambahkan thumbnail avatar
        .setTimestamp();

      // Kirim embed dan gambar sambutan
      await channel.send({ embeds: [embed], files: [welcomeImage] });

    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }
};

// Fungsi untuk mengambil gambar dari URL menggunakan fetch dan memuatnya ke Canvas
async function loadImageFromURL(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer(); // Ambil data sebagai arrayBuffer untuk digunakan oleh Canvas

    // Konversi gambar ke format PNG menggunakan sharp
    const pngBuffer = await sharp(Buffer.from(buffer)).png().toBuffer();
    
    return await loadImage(pngBuffer); // Gunakan buffer PNG untuk di-load ke canvas
  } catch (error) {
    console.error(`Error loading image from URL: ${url}`, error);
    throw error; // Biarkan error dilempar ke luar
  }
}

// Fungsi untuk membuat gambar sambutan
async function generateWelcomeImage(member) {
  // URL latar belakang gambar dari sumber eksternal yang valid
  const backgroundUrl = 'https://res.cloudinary.com/djsbg5pog/image/upload/co_rgb:000000,e_colorize:80/imge.jpg'; 

  const canvas = createCanvas(1060, 175); // Ukuran canvas tetap
  const ctx = canvas.getContext('2d');

  // Muat gambar latar belakang dari URL
  const background = await loadImageFromURL(backgroundUrl);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Setel gaya teks
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Welcome to ${member.guild.name}`, canvas.width / 2.5, canvas.height / 3.5);

  ctx.font = '24px sans-serif';
  ctx.fillText(`${member.user.username}#${member.user.discriminator}`, canvas.width / 2.5, canvas.height / 1.8);

  // Muat avatar pengguna dari URL, pastikan format png
  const avatarUrl = member.user.displayAvatarURL({ format: 'png', size: 1024 });
  const avatar = await loadImageFromURL(avatarUrl);

  const avatarSize = 100; // Ukuran avatar lebih kecil
  const avatarX = 50; // Posisi avatar di sebelah kiri (50px dari kiri)
  const avatarY = canvas.height / 2 - avatarSize / 2; // Posisikan secara vertikal di tengah

  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

  return {
    attachment: canvas.toBuffer(),
    name: 'welcome-image.png'
  };
}
