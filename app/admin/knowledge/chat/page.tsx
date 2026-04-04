"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: string; title: string; category: string | null }>;
}

export default function KnowledgeChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/knowledge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: json.data.answer,
            sources: json.data.sources || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.message || "ã¨ã©ã¼ãçºçãã¾ããã" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "éä¿¡ã¨ã©ã¼ãçºçãã¾ããã" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* ãããã¼ */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/admin/knowledge"
          className="text-sm text-gray-500 hover:text-primary transition-colors"
        >
          &larr; ãã¬ãã¸ä¸è¦§
        </Link>
        <h1 className="text-2xl font-bold text-primary">AI ãã¬ãã¸æ¤ç´¢</h1>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Beta</span>
      </div>

      {/* ãã£ããã¨ãªã¢ */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-5xl mb-4">&#x1F50D;</div>
            <p className="text-lg font-medium mb-2">ãã¬ãã¸DBãAIã§æ¤ç´¢</p>
            <p className="text-sm">
              è³ªåãå¥åããã¨ãèç©ããããã¬ãã¸ããé¢é£æå ±ãæ¤ç´¢ã»åç­ãã¾ãã
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "é¢æ¥å¯¾ç­ã®ãã¤ã³ãã¯ï¼",
                "ITæ¥­çã®ææ°ååã¯ï¼",
                "åå®çãé«ãä¼æ¥­ã¯ï¼",
                "ä¸åæ ¼ã®ä¸»ãªçç±ã¯ï¼",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* åç§ã½ã¼ã¹ */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">åç§ãã¬ãã¸:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((s) => (
                      <Link
                        key={s.id}
                        href={`/admin/knowledge/${s.id}`}
                        className="text-xs bg-white border border-gray-300 hover:border-blue-400 text-blue-600 px-2 py-0.5 rounded transition-colors"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500">
              <Spinner size={16} className="inline mr-2" />
              æ¤ç´¢ä¸­...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* å¥åã¨ãªã¢ */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ãã¬ãã¸ã«é¢ããè³ªåãå¥å..."
          className="flex-1 border border-secondary rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-cta hover:bg-cta-hover text-primary font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          éä¿¡
        </button>
      </form>
    </div>
  );
}
