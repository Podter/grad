import consola from "consola";
import { Routes } from "discord.js";
import { env } from "~/env";
import type { Grad } from "../grad";

export async function registerInteractions(grad: Grad) {
  try {
    await grad.rest.put(
      Routes.applicationGuildCommands(env.APPLICATION_ID, env.DEV_GUILD_ID),
      {
        body: grad.interactions.map((interaction) => interaction.data.toJSON()),
      },
    );
    consola.success("Successfully registered interactions");
  } catch (error) {
    consola.error("Failed to register interactions:", error);
  }
}
