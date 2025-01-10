import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../builder";

export const Ping = new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    const start = performance.now();
    await interaction.deferReply();
    const pingTime = performance.now() - start;
    await interaction.editReply(
      `Pong! Took ${pingTime.toFixed(0)}ms to respond. 🏓`,
    );
  },
});
