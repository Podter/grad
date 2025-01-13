import consola from "consola";
import { Client, Collection, REST } from "discord.js";
import { env } from "~/env";
import { events } from "~/events";
import { interactions } from "~/interactions";
import type { SlashCommand } from "~/interactions/builder";
import { pullModel } from "./ai/ollama";
import { registerInteractions } from "./utils/register";

export class Grad extends Client {
  interactions: Collection<string, SlashCommand>;

  constructor() {
    super({ intents: [] });

    this.rest = new REST().setToken(env.TOKEN);
    this.interactions = new Collection();

    this.pullModels().then(() => {
      this.load();
      this.login(env.TOKEN);
    });
  }

  private async load() {
    events.forEach((event) => event.init(this));
    consola.success(`Loaded \`${events.length}\` events`);

    interactions.forEach((interaction) =>
      this.interactions.set(interaction.data.name, interaction),
    );
    consola.success(`Loaded \`${this.interactions.size}\` interactions`);

    registerInteractions(this);
  }

  private async pullModels() {
    try {
      await Promise.all([
        pullModel(env.CHAT_MODEL),
        pullModel(env.EMBEDDING_MODEL),
      ]);
    } catch {
      consola.error("Failed to pull models");
      process.exit(1);
    }
  }
}
