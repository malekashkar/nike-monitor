import Command from ".";

import { Message, MessageEmbed } from "discord.js";
import { ISku } from "../utils";

export default class SkuCommand extends Command {
  name = "sku";
  description = "Get a list of the skus.";
  usage = "[region]";

  async run(message: Message, args: string[]) {
    const regions = Object.keys(this.bot.settings.channels);
    const region = args[0]
      ? regions.includes(args[0].toLowerCase())
        ? args[0].toLowerCase()
        : null
      : null;

    return await message.channel.send(
      new MessageEmbed()
        .setTitle(`Active SKUS List`)
        .setDescription(
          `${
            region
              ? `You filtered out all regions except ${region.toUpperCase()}.`
              : `No filter set.`
          }`
        )
        .setColor("RANDOM")
        .setTimestamp()
        .addField(
          `Important`,
          this.bot.skus
            .filter((x: ISku) =>
              region ? region === x.region && x.important : x.important
            )
            .map((x: ISku) => `SKU: \`${x.sku}\` | Region: \`${x.region}\``)
            .join("\n") || `There are no sku's available here.`,
          true
        )
        .addField(
          `Non Important`,
          this.bot.skus
            .filter((x: ISku) =>
              region ? region === x.region && !x.important : !x.important
            )
            .map((x: ISku) => `SKU: \`${x.sku}\` | Region: \`${x.region}\``)
            .join("\n") || `There are no sku's available here.`,
          true
        )
    );
  }
}
