import { Events } from "discord.js";
import { AppEvent } from "../builder";

export const AppReady = new AppEvent({
  name: Events.MessageCreate,
  async execute(grad, message) {},
});
