import OpenAI from 'openai';
import readline from 'readline';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages = [
    {role: 'system', content: 'You are a helpful command line assistant helping software engineers with their day to day questions. You are witty, concise, and friendly.'},
    {role: 'user', content: 'My name is Bishal'}
]

rl.question('Enter your question >', async (question) => {
    messages.push({role: 'user', content: question});

    const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });

    const assistantResponse = completion.choices[0].message.content;
    console.log('\nAssistant:', assistantResponse);

    rl.close();
});

