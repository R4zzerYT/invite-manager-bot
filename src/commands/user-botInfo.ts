import { RichEmbed } from 'discord.js';
import { Command, Logger, logger, Message } from 'yamdbf';

import { IMClient } from '../client';
import { guilds } from '../sequelize';
import { CommandGroup, createEmbed, sendEmbed } from '../utils/util';

const config = require('../../config.json');

let cachedAt = 0;
let numGuilds = 0;

export default class extends Command<IMClient> {
	@logger('Command') private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'bot-info',
			aliases: ['botInfo'],
			desc: 'Show info about the bot',
			usage: '<prefix>botInfo',
			group: CommandGroup.Other
		});
	}

	public async action(message: Message, args: string[]): Promise<any> {
		this._logger.log(
			`${message.guild.name} (${message.author.username}): ${message.content}`
		);

		if (Date.now() - cachedAt > 1000 * 60 * 5) {
			console.log('Fetching guild count from DB...');
			numGuilds = await guilds.count({
				where: {
					deletedAt: null
				}
			});
			cachedAt = Date.now();
		}

		const embed = createEmbed(this.client);
		embed.addField('Guilds', numGuilds, true);

		if (this.client.shard) {
			embed.addField('Current Shard', this.client.shard.id, true);
			embed.addField('Total Shards', this.client.shard.count, true);
		}

		if (config.botSupport) {
			embed.addField('Support Discord', config.botSupport);
		}
		if (config.botAdd) {
			embed.addField('Add bot to your server', config.botAdd);
		}
		if (config.botWebsite) {
			embed.addField('Bot website', config.botWebsite);
		}
		if (config.botPatreon) {
			embed.addField('Patreon', config.botPatreon);
		}

		sendEmbed(message.channel, embed, message.author);
	}
}
