import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (client) => {
  const foldersPath = path.join(__dirname, '../../commands');
  try {
    const commandFolders = await fs.readdir(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = await fs.readdir(commandsPath);
      for (const file of commandFiles) {
        if (!file.endsWith('.js')) continue;

        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;

        const { default: command } = await import(fileUrl);

        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
        } else {
          console.error(`[ERROR] The command at ${filePath} is missing required properties 'data' or 'execute'.`);
        }
      }
    }
  } catch (err) {
    console.error('Error loading commands:', err);
  };
};
