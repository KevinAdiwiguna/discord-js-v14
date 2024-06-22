import dotnev from 'dotenv'
dotnev.config()

import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const foldersPath = path.join(__dirname, 'commands');

try {
	const commandFolders = await fs.readdir(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = await fs.readdir(commandsPath);

		for (const file of commandFiles) {
			if (!file.endsWith('.js')) continue;

			const filePath = path.join(commandsPath, file);

			try {
				// Gunakan URL untuk import modul dengan ESM
				const { default: command } = await import(new URL(`file://${filePath}`).pathname);

				if ('data' in command && 'execute' in command) {
					commands.push(command.data.toJSON());
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			} catch (err) {
				console.error(`Error importing ${file}:`, err);
			}
		}
	}

	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

	(async () => {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);
			const data = await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
				{ body: commands }
			);

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			console.error('Error refreshing application (/) commands:', error);
		}
	})();
} catch (err) {
	console.error('Error reading command folders:', err);
	process.exit(1);
}
