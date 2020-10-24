import Command from ".";
import fs from "fs";

import { question, error, getProduct } from "../utils";
import { Message, MessageEmbed } from "discord.js";
import { ISku } from "../utils";

const Region = ["gb", "us", "au", "nz", "ca", "jp", "cn", "fr", "es", "sg"];

export default class AddCommand extends Command {
  name = "add";
  description = "Add a sku code into the list of skus codes.";

  async run(message: Message, args: string[]) {
    const sku =
      args[0] ||
      (await question(
        `What is the sku?\n\`Please provide only a valid SKU\``,
        message
      ));

    const region =
      args[1] && Region.includes(args[1])
        ? args[1]
        : await question(
            `What region is this item from?\n\`Reply with one of the following: ${Region.join(
              ", "
            )}\``,
            message,
            Region
          );

    const restock =
      args[2] && ["yes", "no"].includes(args[2])
        ? args[2]
        : await question(
            `Should I tag on restocks?\n\`Reply with yes or no.\``,
            message,
            ["yes", "no"]
          );

    if (!(await getProduct(sku, region)))
      return message.channel.send(
        error(
          `The SKU \`${sku}\` is not a valid SKU with the region \`${region.toUpperCase()}\`.`
        )
      );

    if (
      this.bot.skus.length &&
      this.bot.skus.some((x: ISku) => x.sku.toLowerCase() === sku.toLowerCase())
    )
      return message.channel.send(
        error(`The SKU \`${sku}\` you provided is already in the list of skus.`)
      );

    this.bot.skus.push({
      sku: sku,
      region: region.toLowerCase(),
      important: restock === "yes",
    });
    fs.writeFileSync("./skus.json", JSON.stringify(this.bot.skus));

    return message.channel.send(
      new MessageEmbed()
        .setTitle(`SKU Added`)
        .setDescription(
          `Sku with the information below has been added into the list of your SKUS.`
        )
        .addField(`SKU`, sku, true)
        .addField(`Region`, region.toUpperCase(), true)
        .addField(`Tag on restock`, restock === "yes" ? `On` : `Off`, true)
        .setColor("RANDOM")
        .setTimestamp()
    );
  }
}
