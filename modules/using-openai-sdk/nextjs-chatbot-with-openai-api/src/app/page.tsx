'use client';

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [message, setMessage] = useState<string>("");


  const handleSendMessage = async () => {

    // Update the message history
    setMessages(m => [...m, { role: "user", content: message }]);

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [ ...messages, { role: "user", content: message } ]}),
    });
    const data = await response.json();

    // Update the message history
    setMessages(m => [...m, { role: "assistant", content: data }]);

    setMessage("");
  }

  return (
    <main>
      <h1 className="text-4xl font-bold">Chatbot with OpenAI API</h1>
      <section className="my-8">
        { /* Render all messages */}
        { messages.map((message, index) => (
          <div key={index} className={`flex flex-row gap-2 ${message.role === "assistant" ? "justify-start bg-gray-500" : "justify-end bg-blue-500"}`}>
            <p className="text-white p-8">{message.content}</p>
          </div>
        ))}
      </section>
        <div className="flex flex-row gap-2">
          <input type="text" className="border-1 border-gray-300 text-white rounded-md p-2 w-full" onChange={(e) => setMessage(e.target.value)} value={message}/>
        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={handleSendMessage}>Send</button>
      </div>
    </main>
  );
}
