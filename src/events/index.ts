import { InteractionCreate } from "./handlers/interaction-create";
import { MessageCreate } from "./handlers/message-create";
import { AppReady } from "./handlers/ready";

export const events = [AppReady, MessageCreate, InteractionCreate];
