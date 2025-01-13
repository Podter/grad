import consola from "consola";
import { Events } from "discord.js";
import { generateChat } from "~/ai";
import { UserMessage } from "~/ai/lib/message";
import { AppEvent } from "../builder";

export const MessageCreate = new AppEvent({
  name: Events.MessageCreate,
  async execute(grad, message) {
    if (message.reference) {
      const store = grad.getChatMessagesStore(message.reference);
      if (store) {
        consola.info(
          `ai is replying to a message from \`${message.author.username}\``,
        );
        await message.channel.sendTyping();

        const userMessage = new UserMessage(message.author, message.content);
        store.add(userMessage);

        const gradMessage = await generateChat(grad, store);
        const reply = await message.reply({
          content: gradMessage.message,
        });

        store.addSearchIndex(reply);
      }
    }
  },
});
