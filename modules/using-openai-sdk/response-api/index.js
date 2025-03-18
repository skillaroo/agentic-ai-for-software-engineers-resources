import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const response = await client.responses.create({
  model: 'gpt-4o',
  instructions: 'You are a coding assistant that talks like a pirate',
  tools: [{ type: "web_search_preview" }],
  input: 'What is the sum of 2 + 2?',
});

console.log(response.output_text);