import { SlashCommandBuilder } from "discord.js";
import { generateChat } from "~/ai";
import { ChatMessagesStore, UserMessage } from "~/ai/lib/message";
import { SlashCommand } from "../builder";

export const Grad = new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("grad")
    .setDescription("Chat with Grad.")
    .addStringOption((option) =>
      option.setName("message").setDescription("The message to send to Grad."),
    ),
  async execute(interaction, grad) {
    const message = interaction.options.getString("message");

    await interaction.deferReply();

    const messages = new ChatMessagesStore();
    const userMessage = new UserMessage(interaction.user, message ?? "Hello");
    messages.add(userMessage);

    const gradMessage = await generateChat(grad, messages);
    const reply = await interaction.editReply({
      content: gradMessage.message,
    });

    messages.addSearchIndex(reply);
  },
});
