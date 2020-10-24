import Command from ".";

import { Message, TextChannel } from "discord.js";
import {
  question,
  getProduct,
  getExtraDetails,
  productToEmbed,
  sendEmbed,
  error,
} from "../utils";

const Region = ["gb", "us", "au", "nz", "ca", "jp", "cn", "fr", "es", "sg"];

export default class StockCommand extends Command {
  name = "stock";
  description = "Get the current stock of an SKU.";

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

    const product = await getProduct(sku, region);
    if (!product)
      return message.channel.send(
        error(
          `The SKU \`${sku}\` is not a valid SKU with the region \`${region.toUpperCase()}\`.`
        )
      );

    const extras = await getExtraDetails(sku, region);
    const embedDetails = productToEmbed(product, extras);
    await sendEmbed(message.channel as TextChannel, embedDetails, false);
  }
}
