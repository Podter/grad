import type { Awaitable, ClientEvents } from "discord.js";
import type { Grad } from "~/lib/grad";

type ExecuteEvent<Event extends keyof ClientEvents> = (
  grad: Grad,
  ...args: ClientEvents[Event]
) => Awaitable<void>;

interface AppEventOptions<Event extends keyof ClientEvents> {
  name: Event;
  once?: boolean;
  execute: ExecuteEvent<Event>;
}

export class AppEvent<Event extends keyof ClientEvents> {
  private readonly name: Event;
  private readonly once: boolean;
  private readonly execute: ExecuteEvent<Event>;

  constructor({ name, once = false, execute }: AppEventOptions<Event>) {
    this.name = name;
    this.once = once;
    this.execute = execute;
  }

  init(grad: Grad) {
    if (this.once) {
      grad.once(this.name, (...args) => this.execute(grad, ...args));
    } else {
      grad.on(this.name, (...args) => this.execute(grad, ...args));
    }
  }
}
