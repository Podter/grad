import axios from "axios";
import { z } from "zod";
import { Tool } from "../lib/tool";

const DEFAULT_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-US,en;q=0.5",
  // "Alt-Used": "LEAVE-THIS-KEY-SET-BY-TOOL",
  Connection: "keep-alive",
  // Host: "LEAVE-THIS-KEY-SET-BY-TOOL",
  Referer: "https://www.google.com/",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "cross-site",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
};

export const WebBrowser = new Tool({
  name: "web_browser",
  description: "The URL of the page to fetch content from.",
  schema: z.object({
    url: z
      .string()
      .url()
      .describe("The URL of the page to fetch content from."),
  }),
  async execute({ url }) {
    try {
      const domain = new URL(url).hostname;
      const { data } = await axios.get(url, {
        withCredentials: true,
        headers: {
          ...DEFAULT_HEADERS,
          Host: domain,
          "Alt-Used": domain,
        },
      });

      return data;
    } catch (e) {
      return {
        error: "Failed to get the web content.",
        stack: e,
      };
    }
  },
});
