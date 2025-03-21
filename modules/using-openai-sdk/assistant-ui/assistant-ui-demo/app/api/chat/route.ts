import { openai } from "@ai-sdk/openai";
import { jsonSchema, streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, } = await req.json();

  const result = streamText({
    model: openai.responses("gpt-4o"),
    messages,
    // forward system prompt from the frontend
    system,
    tools: {
      web_search_preview: openai.tools.webSearchPreview()
    }
    
  });

  return result.toDataStreamResponse();
}
