import Command from ".";
import fs from "fs";

import { question, error, normal } from "../utils";
import { Message } from "discord.js";
import { ISku } from "../utils";

export default class RemoveCommand extends Command {
  name = "remove";
  description = "Remove an sku code from the list of skus.";

  async run(message: Message, args: string[]) {
    const sku =
      args[0] ||
      (await question(
        `What is the sku?\n\`Please provide an SKU from the list.\``,
        message
      ));

    if (this.bot.skus.length && !this.bot.skus.some((x: ISku) => x.sku === sku))
      return message.channel.send(
        error(`The SKU \`${sku}\` you provided is not in the list of skus.`)
      );

    this.bot.skus = this.bot.skus.filter((x: ISku) => x.sku !== sku);
    fs.writeFileSync("./skus.json", JSON.stringify(this.bot.skus));

    return message.channel.send(
      normal(`SKU Removed`, `You removed SKU \`${sku}\` from the list of SKUS.`)
    );
  }
}
