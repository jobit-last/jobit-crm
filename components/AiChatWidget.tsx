"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize current page
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPage(window.location.pathname);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear unread indicator when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  const suggestions = [
    "今日のダッシュボード概要は？",
    "アクティブな求職者は何名？",
    "最近の選考状況を教えて",
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInputValue("");
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentPage,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.response) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.data.response,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: data.message || "エラーが発生しました。もう一度試してください。",
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "通信エラーが発生しました。接続を確認してください。",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        style={{
          width: "56px",
          height: "56px",
          backgroundColor: "#0d9488",
          animation: isOpen ? "none" : "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
        aria-label="AI アシスタント"
      >
        {/* Chat Icon SVG */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "#ffffff" }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>

        {/* Unread indicator dot */}
        {hasUnread && !isOpen && (
          <div
            className="absolute top-1 right-1 rounded-full"
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#ef4444",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300"
          style={{
            width: "400px",
            height: "500px",
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: "#0d9488" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="rounded-full flex items-center justify-center text-white"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span className="font-semibold text-sm">Jobit AI アシスタント</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="閉じる"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            style={{ scrollBehavior: "smooth" }}
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 px-4">
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🤖</div>
                <p className="font-medium text-gray-700 text-sm mb-1">
                  AI アシスタントへようこそ
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  CRM業務をサポートします。何かお王言いできることはありますか？
                </p>

                {/* Suggestions */}
                <div className="w-full space-y-2 mt-4">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-teal-50 hover:border-teal-300 transition-colors text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                      style={
                        msg.role === "user"
                          ? {
                              backgroundColor: "#0d9488",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "#e5e7eb",
                              color: "#374151",
                            }
                      }
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div
                      className="px-3 py-2 rounded-lg text-sm"
                      style={{ backgroundColor: "#e5e7eb", color: "#6b7280" }}
                    >
                      <div className="flex gap-1 items-center">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "#6b7280",
                            animationDelay: "0ms",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "#6b7280",
                            animationDelay: "150ms",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "#6b7280",
                            animationDelay: "300ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="質問を入力..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#0d9488",
                }}
                aria-label="送信"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
