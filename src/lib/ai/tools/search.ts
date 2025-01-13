import { z } from "zod";
import { env } from "~/env";
import { omit, pick } from "~/lib/utils/object";
import { Tool } from "../lib/tool";

export const Search = new Tool({
  name: "search",
  description: "Search across the web with Searxng.",
  schema: z.object({
    query: z.string().describe("Search query."),
  }),
  async execute({ query }) {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        format: "json",
      });

      const data = await fetch(
        `${env.SEARXNG_API}/search?${searchParams.toString()}`,
      ).then((res) => res.json());

      const results = data.results
        .slice(0, 15)
        .map((result: object) =>
          omit(
            result,
            "parsed_url",
            "engines",
            "positions",
            "template",
            "thumbnail",
          ),
        );

      return {
        ...pick(
          data,
          "query",
          "results",
          "answers",
          "infoboxes",
          "suggestions",
        ),
        results,
      };
    } catch (e) {
      return {
        error: "Failed to fetch search results.",
        stack: e,
      };
    }
  },
});
