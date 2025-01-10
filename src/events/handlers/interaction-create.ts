import { consola } from "consola";
import { Events } from "discord.js";
import { AppEvent } from "../builder";

export const InteractionCreate = new AppEvent({
  name: Events.InteractionCreate,
  async execute(grad, interaction) {
    // If the interaction is not a command, ignore it
    if (!interaction.isChatInputCommand()) {
      return;
    }

    // Get the command that was executed
    const command = grad.interactions.get(interaction.commandName);

    // If the command does not exist, ignore the interaction
    if (!command) {
      consola.error(
        `No interaction matching \`${interaction.commandName}\` was found`,
      );
      return;
    }

    try {
      const tick = performance.now();
      await command.execute(interaction, grad);
      const tock = performance.now();

      consola.info(
        `\`${interaction.commandName}\` executed by \`${interaction.user.globalName}\` took \`${((tock - tick) / 1000).toFixed(2)}s\``,
      );
    } catch (error) {
      consola.error(
        `Failed to execute \`${interaction.commandName}\` for \`${interaction.user.globalName}\`:`,
        error,
      );
    }
  },
});
