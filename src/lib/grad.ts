import consola from "consola";
import {
  Client,
  Collection,
  GatewayIntentBits,
  type Message,
  type MessageReference,
  REST,
} from "discord.js";
import { ChatMessagesStore } from "~/ai/lib/message";
import { env } from "~/env";
import { events } from "~/events";
import { interactions } from "~/interactions";
import type { SlashCommand } from "~/interactions/builder";
import { createEmbeddings } from "../ai/models/vector";
import { registerInteractions } from "./utils/register";

export class Grad extends Client {
  interactions: Collection<string, SlashCommand>;

  memories!: Awaited<ReturnType<typeof createEmbeddings>>["memories"];
  infoMemories!: Awaited<ReturnType<typeof createEmbeddings>>["gradInfo"];

  chatMessagesStores: ChatMessagesStore[];

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.rest = new REST().setToken(env.TOKEN);
    this.interactions = new Collection();
    this.chatMessagesStores = [];

    this.load();
    this.login(env.TOKEN);
  }

  private async load() {
    const embeddings = await createEmbeddings();
    this.memories = embeddings.memories;
    this.infoMemories = embeddings.gradInfo;
    consola.success("Loaded embeddings");

    events.forEach((event) => event.init(this));
    consola.success(`Loaded \`${events.length}\` events`);

    interactions.forEach((interaction) =>
      this.interactions.set(interaction.data.name, interaction),
    );
    consola.success(`Loaded \`${this.interactions.size}\` interactions`);

    registerInteractions(this);
  }

  getChatMessagesStore(message: Message | MessageReference) {
    const index = ChatMessagesStore.messageToChatMessagesStoreSearch(message);
    for (const store of this.chatMessagesStores) {
      if (store.searchIndexes.includes(index)) {
        return store;
      }
    }
    return undefined;
  }
}
