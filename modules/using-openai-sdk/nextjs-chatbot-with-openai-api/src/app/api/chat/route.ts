import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {

    const { messages } = await req.json();


    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages
        ]
    });

    return NextResponse.json(completion.choices[0].message.content);

}