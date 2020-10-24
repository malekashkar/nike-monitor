import Bot from "..";

import { Message } from "discord.js";

export default abstract class Command {
  disabled = false;
  usage = "";
  bot: Bot;

  abstract name: string;
  abstract description: string;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  abstract async run(
    _message: Message,
    _args: string[],
    _command?: string
  ): Promise<Message | void>;
}
