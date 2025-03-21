import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Create a transform stream to convert OpenAI events to a raw stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const openaiStream = await openai.responses.create({
            model: "gpt-4o",
            instructions: "You are a helpful assistant that can answer questions and help with tasks.",
            input: messages,
            stream: true,
          });
          
          // Process the stream more efficiently
          for await (const chunk of openaiStream) {
            // Forward each chunk as a single line of JSON, with newline separator
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
          }
          
          // Signal the end of the stream
          controller.close();
        } catch (error) {
          console.error('Error processing OpenAI stream:', error);
          controller.enqueue(encoder.encode(JSON.stringify({ error: String(error) }) + "\n"));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
      }
    });
}