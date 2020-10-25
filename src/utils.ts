import { TextChannel, MessageEmbed, Message } from "discord.js";
import fetch from "node-fetch";

export interface ISettings {
  interval: number;
  prefix: string;
  token: string;
  channels: {
    gb: string;
    nz: string;
    ca: string;
    us: string;
    au: string;
  };
}

export interface ISku {
  sku: string;
  region: string;
  important: boolean;
}

export interface IProduct {
  title: string;
  squarishURL: string;
  slug: string;
  status: string;
  commerceStartDate?: string;
  skuInfos: IDetails[];
}

interface IDetails {
  id?: string;
  productId?: string;
  resourceType?: string;
  available?: boolean;
  level?: string;
  skuId?: string;
  nikeSize?: string;
}

interface IExtra {
  goat: string;
  stockX: string;
  sku: string;
  region: string;
  task: string;
  important: boolean;
}

export async function getProduct(sku: string, region: string) {
  const response = await fetch(
    `https://csdj48vyje.execute-api.us-east-1.amazonaws.com/dev/product`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sku, country: region.toLowerCase() }),
      method: "POST",
    }
  );

  if (!response.ok) return false;
  else return (await response.json()) as IProduct;
}

export function error(err: string) {
  return new MessageEmbed()
    .setTitle(`Error Caught`)
    .setColor("RED")
    .setDescription(err)
    .setTimestamp();
}

export function normal(title: string, text: string) {
  return new MessageEmbed()
    .setTitle(title)
    .setColor("RANDOM")
    .setDescription(text)
    .setTimestamp();
}

export async function question(
  question: string,
  message: Message,
  required: string[] = []
) {
  const msg = await message.channel.send(question);
  const answer = await message.channel.awaitMessages(
    (x) =>
      x.author.id === message.author.id && required.length
        ? required.includes(x.content.toLowerCase())
        : true,
    {
      max: 1,
      time: 900000,
      errors: ["time"],
    }
  );

  if (msg.deletable) msg.delete();
  if (answer.first().deletable) answer.first().delete();

  return answer.first().content;
}

export async function sendEmbed(
  channel: TextChannel,
  embed: MessageEmbed,
  tag: Boolean
) {
  try {
    if (tag) channel.send(`@everyone`);
    channel.send({ embed });
  } catch (e) {
    return false;
  }
}

export function productToEmbed(product: IProduct, extra: IExtra) {
  const embed = new MessageEmbed()
    .setTitle(product.title)
    .setURL(`https://www.nike.com/us/t/${product.slug}/${extra.sku}`)
    .setColor(extra.important ? "RED" : "GOLD")
    .setThumbnail(product.squarishURL)
    .setFooter(`Cheetah Nike Monitor v1.0`)
    .setTimestamp()
    .addFields(
      {
        name: "Status",
        value: `${
          product.status.toLowerCase() === "active"
            ? `🟢`
            : product.status.toLowerCase() === "inactive" ||
              product.status.toLowerCase() === "hold"
            ? `🔴`
            : `🟠`
        }`,
        inline: true,
      },
      {
        name: "Price",
        value: `N/A`,
        inline: true,
      },
      { name: "Cart Limit", value: `1`, inline: true },
      {
        name: "Style Code",
        value: extra.sku,
        inline: true,
      },
      {
        name: "Region",
        value: extra.region,
        inline: true,
      },
      {
        name: "Task",
        value: `[Task Link](${extra.task})`,
        inline: true,
      },
      {
        name: "Sizes & Stock Levels",
        value: product.skuInfos
          .map((x) => {
            if (x.available)
              return `${x.nikeSize} - [${x.available ? x.level : `SOLD OUT`}]`;
          })
          .filter((x) => !!x)
          .join("\n"),
      },
      {
        name: "Links",
        value: `| [GOAT](${extra.goat}) | [StockX](${extra.stockX}) |`,
        inline: true,
      }
    );

  return embed;
}

export function getExtraDetails(
  sku: string,
  region: string,
  important?: boolean
) {
  const information = {
    goat: `https://www.goat.com/search?query=${sku}`,
    stockX: `https://stockx.com/search?s=${sku}`,
    sku,
    region,
    task: `https://twitter.com/theCheetahBot`,
    important,
  };
  return information as IExtra;
}
