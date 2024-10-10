import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (client) => {
  try {
    const eventsPath = path.join(__dirname, '../../events');
    const eventFiles = await fs.readdir(eventsPath);

    for (const file of eventFiles) {
      if (!file.endsWith('.js')) continue;

      const filePath = path.join(eventsPath, file);
      const fileUrl = pathToFileURL(filePath).href;

      const { default: event } = await import(fileUrl);

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