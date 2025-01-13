import { z } from "zod";
import { Tool } from "../lib/tool";

interface SearchResults {
  query: {
    search: Array<{
      title: string;
    }>;
  };
}

interface PageResult {
  batchcomplete: string;
  query: {
    pages: Record<
      string,
      {
        pageid: number;
        ns: number;
        title: string;
        extract: string;
      }
    >;
  };
}

const BASE_URL = "https://en.wikipedia.org/w/api.php";

export const Wikipedia = new Tool({
  name: "wikipedia_api",
  description:
    "A tool for interacting with and fetching data from the Wikipedia API.",
  schema: z.object({
    query: z.string().describe("The query to search for on Wikipedia."),
  }),
  async execute({ query }) {
    const searchParams = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
    });
    const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
    const searchResults: SearchResults = await response.json();

    const summaries = await Promise.all(
      searchResults.query.search.slice(0, 3).map(async ({ title }) => {
        const params = new URLSearchParams({
          action: "query",
          prop: "extracts",
          explaintext: "true",
          redirects: "1",
          format: "json",
          titles: title,
        });

        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        const data: PageResult = await response.json();

        const { pages } = data.query;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];

        return `Page: ${page}\nSummary: ${page.extract}`;
      }),
    );

    if (summaries.length === 0) {
      return {
        error: "No good Wikipedia Search Result was found.",
      };
    }

    return summaries.join("\n\n").slice(0, 4096);
  },
});
