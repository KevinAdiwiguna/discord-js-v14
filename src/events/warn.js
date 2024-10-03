/**
 * @param {import('@src/structures').BotClient} client
 * @param {string} message
 */
export default async (client, message) => {
  client.logger.warn(`Client Warning: ${message}`);
};
