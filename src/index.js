import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');

async function loadCommands() {
  try {
    const commandFolders = await fs.readdir(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = await fs.readdir(commandsPath);
      for (const file of commandFiles) {
        if (!file.endsWith('.js')) continue;

        const filePath = path.join(commandsPath, file);
        const { default: command } = await import(new URL(`file://${filePath}`).pathname);

        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }
  } catch (err) {
    console.error('Error loading commands:', err);
  }
}

async function loadEvents() {
  try {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = await fs.readdir(eventsPath);

    for (const file of eventFiles) {
      if (!file.endsWith('.js')) continue;

      const filePath = path.join(eventsPath, file);
      const { default: event } = await import(new URL(`file://${filePath}`).pathname);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  } catch (err) {
    console.error('Error loading events:', err);
  }
}

async function startBot() {
  await loadCommands();
  await loadEvents();
  
  try {
    await client.login(process.env.token);
  } catch (err) {
    console.error('Error logging in:', err);
  }
}

startBot();
