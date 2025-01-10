import type {
  Awaitable,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import type { Grad } from "~/lib/grad";

interface BaseInteractionOptions {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  execute: (
    interaction: ChatInputCommandInteraction,
    grad: Grad,
  ) => Awaitable<void>;
}

export class SlashCommand {
  readonly data: BaseInteractionOptions["data"];
  readonly execute: BaseInteractionOptions["execute"];

  constructor({ data, execute }: BaseInteractionOptions) {
    this.data = data;
    this.execute = execute;
  }
}
