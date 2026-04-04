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
          { role: "assistant", content: json.message || "エラーが発生しました。" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "通信エラーが発生しました。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/admin/knowledge"
          className="text-sm text-gray-500 hover:text-primary transition-colors"
        >
          &larr; ナレッジ一覧
        </Link>
        <h1 className="text-2xl font-bold text-primary">AI ナレッジ検索</h1>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Beta</span>
      </div>

      {/* チャットエリア */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-5xl mb-4">&#x1F50D;</div>
            <p className="text-lg font-medium mb-2">ナレッジDBをAIで検索</p>
            <p className="text-sm">
              質問を入力すると、蓄積されたナレッジから関連情報を検索・回答します。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "面接対策のポイントは？",
                "IT業界の最新動向は？",
                "内定率が高い企業は？",
                "不合格の主な理由は？",
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

              {/* 参照ソース */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">参照ナレッジ:</p>
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
              検索中...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ナレッジに関する質問を入力..."
          className="flex-1 border border-secondary rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-cta hover:bg-cta-hover text-primary font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          送信
        </button>
      </form>
    </div>
  );
}
