"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Simple OpenAI Chat with streaming responses
 * This file demonstrates how to create a chat interface that handles
 * streaming responses from OpenAI's API in a simple, educational way.
 */

// Define the structure of our chat messages
interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Process a streaming response from OpenAI
 * This function handles the streaming response and calls the updateMessageContent
 * function whenever new content is received.
 */
async function processStream(response: Response, updateMessageContent: (content: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) return;
  
  const decoder = new TextDecoder();
  let buffer = ""; // Buffer to store partial chunks
  
  // Read the stream until it's done
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Convert the chunk to text and add to buffer
    buffer += decoder.decode(value, { stream: true });
    
    // Process each complete line in the buffer
    const lines = buffer.split("\n");
    // The last line might be incomplete, keep it for the next iteration
    buffer = lines.pop() || "";
    
    // Process each complete line
    for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines
      
      // Parse each line as a JSON object
      try {
        const chunk = JSON.parse(line);
        
        // Extract text content based on OpenAI response chunk type
        if (chunk.type === "response.output_text.delta" && chunk.delta) {
          updateMessageContent(chunk.delta);
        }
      } catch (e) {
        // Minimal error handling - just continue with next line
        console.log("Could not parse line:", line);
      }
    }
  }
  
  // Process any remaining content in the buffer
  if (buffer.trim()) {
    try {
      const chunk = JSON.parse(buffer);
      if (chunk.type === "response.output_text.delta" && chunk.delta) {
        updateMessageContent(chunk.delta);
      }
    } catch (e) {
      // Minimal error handling for final buffer
      console.log("Could not parse final buffer");
    }
  }
}

export default function Home() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle chat form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't do anything if input is empty or if we're already loading
    if (!input.trim() || isLoading) return;
    
    // Add user message to the chat
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input and set loading state
    setInput("");
    setIsLoading(true);
    
    // Add an empty assistant message that will be updated as the stream comes in
    setMessages(prevMessages => [
      ...prevMessages,
      { role: "assistant", content: "" }
    ]);

    try {
      // Make the API request
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      // Function to update the assistant's message with new content
      const updateAssistantMessage = (newContent: string) => {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.role === "assistant") {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + newContent,
            };
            return updatedMessages;
          }
          return prevMessages;
        });
      };
      
      // Process the stream with our update function
      await processStream(response, updateAssistantMessage);
    } catch (error) {
      console.log("Error in chat request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 max-w-3xl mx-auto">
      <header className="py-4 text-center">
        <h1 className="text-2xl font-bold">NextJS Streaming Chatbot with OpenAI API</h1>
      </header>
      
      <main className="overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Send a message to start the conversation
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                message.role === "user" 
                  ? "bg-blue-500 text-white ml-auto max-w-[80%]" 
                  : "bg-white border border-gray-200 max-w-[80%] text-black"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>
      
      <form className="flex gap-2 py-4" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
