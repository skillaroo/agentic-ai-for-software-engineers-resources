import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: "a white fluffy puppy playing with a ball",
  n: 1,
  size: "1024x1024",
});

console.log(response.data[0].url);