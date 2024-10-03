/**
 * @param {import('@src/structures').BotClient} client
 * @param {Error} error
 */
export default async (client, error) => {
  client.logger.error(`Client Error`, error);
};
