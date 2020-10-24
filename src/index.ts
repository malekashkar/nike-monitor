import chalk from "chalk";
import path from "path";
import fs from "fs";

import skus from "./skus.json";
import Command from "./commands";
import settings from "./settings";
import { IProduct } from "./utils";

import {
  Client,
  ClientOptions,
  Collection,
  Message,
  TextChannel,
} from "discord.js";

import {
  getProduct,
  getExtraDetails,
  productToEmbed,
  sendEmbed,
  ISettings,
  ISku,
} from "./utils";

export default class Bot extends Client {
  cache: Collection<string, IProduct> = new Collection();
  commands: Collection<string, Command> = new Collection();
  skus: ISku[] = skus;
  settings: ISettings = settings;
  productsCache: Collection<string, IProduct> = new Collection();

  constructor(options: ClientOptions) {
    super({
      ...options,
      partials: ["MESSAGE", "REACTION", "CHANNEL"],
    });

    this.on("message", this.onMessage);
    this.on("ready", this.onReady);
    this.monitor();
    this.loadCommands();
  }

  async loadCommands(dir: string = path.join(__dirname, "commands")) {
    const directoryStats = fs.statSync(dir);
    if (!directoryStats.isDirectory()) return;

    const commandFiles = fs.readdirSync(dir);
    for (const commandFile of commandFiles) {
      const commandPath = path.join(dir, commandFile);
      const commandFileStats = fs.statSync(commandPath);

      if (!commandFileStats.isFile()) continue;
      if (path.parse(commandPath).name === "index") continue;
      if (!/^.*\.(js|ts|jsx|tsx)$/i.test(commandFile)) continue;

      const tmpCommand = require(commandPath);
      const command = tmpCommand.default;
      const commandObj: Command = new command(this);

      if (commandObj && commandObj.name) {
        if (this.commands.has(commandObj.name))
          throw `Duplicate command name ${commandObj.name}`;
        else this.commands.set(commandObj.name, commandObj);
      }
    }
  }

  async monitor() {
    setInterval(async () => {
      try {
        if (!skus.length) return;

        for (const group of skus) {
          const product = await getProduct(group.sku, group.region);
          if (!product) continue;

          const productInCache = this.productsCache.get(group.sku);
          if (!productInCache || productInCache !== product) {
            const extras = await getExtraDetails(
              group.sku,
              group.region,
              group.important
            );
            if (!extras) continue;

            const embedDetails = productToEmbed(product, extras);
            if (!embedDetails) continue;

            type Region = "gb" | "nz" | "ca" | "us" | "au";
            const channel = this.channels.resolve(
              this.settings.channels[group.region.toLowerCase() as Region]
            ) as TextChannel;

            try {
              await sendEmbed(channel, embedDetails, group.important);
            } catch (e) {
              console.log(chalk.red(e.stack));
            }

            this.productsCache.set(group.sku, product);
          }
        }
      } catch (e) {
        console.log(chalk.red(e.stack));
      }
    }, settings.interval * 1000);
  }

  async onMessage(message: Message) {
    try {
      if (!message.author) return;
      if (message.author.bot) return;

      const prefixRegex = new RegExp(
        `^${this.settings.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i"
      );
      const prefixMatch = message.content.match(prefixRegex);
      const prefix =
        prefixMatch && prefixMatch[0] ? prefixMatch[0] : this.settings.prefix;

      if (message.content.indexOf(prefix) !== 0) return;

      const content = message.content.replace(prefixRegex, "");
      const args = content.trim().replace(/ /g, "\n").split(/\n+/g);
      const command = args.shift().toLowerCase();

      try {
        for (const commandObj of this.commands.array()) {
          if (commandObj.disabled) continue;
          if (commandObj.name.toLowerCase() === command) {
            commandObj.run(message, args, command).catch((err) => {
              console.log(chalk.red(err));
            });
            return;
          }
        }
      } catch (err) {
        console.log(chalk.red(err.stack));
      }
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }

  async onReady() {
    console.log(chalk.green(`The monitor and bot is now toggled on.`));

    if (!skus.length) return;
    for (const group of skus) {
      const product = await getProduct(group.sku, group.region);
      if (!product) continue;

      this.productsCache.set(group.sku, product);
    }
  }
}

const bot = new Bot({});
bot.login(settings.token);
