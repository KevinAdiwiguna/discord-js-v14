import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import fs from "fs";
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.commands = new Collection();

const functionFolders = fs.readdirSync(join(__dirname, "../src/functions"));
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(join(__dirname, `../src/functions/${folder}`))
    .filter((file) => file.endsWith(".js"));

  for (const file of functionFiles) {
    const filePath = join(__dirname, `../src/functions/${folder}/${file}`);
    const fileUrl = pathToFileURL(filePath).href;

    import(fileUrl).then((module) => {
      module.default(client);
    }).catch((err) => {
      console.error(`Error importing file ${filePath}:`, err);
    });
  } 
}


(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error('Error logging in:', err);
  }
})();
