import { InteractionCreate } from "./handlers/interaction-create";
import { AppReady } from "./handlers/ready";

export const events = [AppReady, InteractionCreate];
