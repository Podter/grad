# Grad

![Grad saying hello](docs/hello.png)

Grad is a Discord AI chatbot with tools. She can search the web, use calculator, and remembering user information!

## Configurating

Make a copy of the `.env.example` file and rename it to `.env`. Fill in the required fields.

You can change the system prompt by modifying `src/ai/models/prompts/chat.md`.

You can change Grad's personality (what she likes, what she loves) by modifying `GRAD_INFO` array in `src/ai/constants.ts`.

You need to rebuild the project after modifying the files.

## Building

Make sure you have Bun installed. Then install the dependencies:

```bash
bun install
```

Then build the project:

```bash
bun run build
```

The output binary will be in the `out/grad` or `out/grad.exe`.

## Running

To run the bot, simply run the output binary:

```bash
# Unix
./out/grad

# Windows
./out/grad.exe
```

## Development

To run the bot in development mode, run the following command:

```bash
bun run dev
```

The bot will automatically restart when you make changes to the source code. Good for experimenting with the system prompt, personality, etc.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.
