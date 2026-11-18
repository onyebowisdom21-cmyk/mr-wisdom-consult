"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };
const suggestions = [
  "What consulting services do you offer?",
  "Show me current opportunities.",
  "How can I get in touch?",
];

function renderAnswer(text: string) {
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const output = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    output.push(text.slice(cursor, match.index));
    const label = match[1];
    const href = match[2];
    if (!label || !href) {
      output.push(match[0]);
      cursor = match.index + match[0].length;
      continue;
    }
    if (href.startsWith("/") && !href.startsWith("//")) {
      output.push(<Link href={href} key={match.index}>{label}</Link>);
    } else {
      let safe = false;
      try {
        const protocol = new URL(href).protocol;
        safe = protocol === "https:" || protocol === "http:" || protocol === "mailto:";
      } catch {
        safe = false;
      }
      output.push(safe
        ? <a href={href} key={match.index} rel="noopener noreferrer" target="_blank">{label} ↗</a>
        : label);
    }
    cursor = match.index + match[0].length;
  }
  output.push(text.slice(cursor));
  return output;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || pending) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setPending(true);
    const sessionId = sessionStorage.getItem("wisdom-chat-session") ?? crypto.randomUUID();
    sessionStorage.setItem("wisdom-chat-session", sessionId);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: next.slice(-10),
        }),
      });
      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? "The assistant is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: answer }]);
      }
      answer += decoder.decode();
      setMessages([...next, {
        role: "assistant",
        content: answer || "The advisor could not respond just now. Please try again or use the contact form.",
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The assistant is unavailable right now.";
      setMessages([...next, { role: "assistant", content: message }]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      {open && (
        <section className="chat-panel" aria-label="Wisdom AI Advisor">
          <div className="chat-head">
            <strong>Wisdom AI Advisor</strong>
            <p>Ask about services, products and opportunities.</p>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div>
                <p>Welcome. What would you like to explore?</p>
                {suggestions.map((suggestion) => (
                  <button
                    className="button secondary"
                    key={suggestion}
                    onClick={() => void sendMessage(suggestion)}
                    style={{ display: "flex", width: "100%", marginBlock: 8, color: "var(--ink)", borderColor: "var(--line)" }}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message, index) => (
              <p className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
                {message.content ? renderAnswer(message.content) : (pending && message.role === "assistant" ? "Thinking…" : "")}
              </p>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              aria-label="Ask the advisor"
              maxLength={1200}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question…"
              value={input}
            />
            <button aria-label="Send message" disabled={pending || !input.trim()} type="submit">Send</button>
          </form>
        </section>
      )}
      <button
        aria-expanded={open}
        aria-label={open ? "Close Wisdom AI Advisor" : "Open Wisdom AI Advisor"}
        className="chat-launcher"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? "×" : "AI"}
      </button>
    </>
  );
}
