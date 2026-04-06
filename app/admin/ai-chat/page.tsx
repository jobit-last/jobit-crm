"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  tablesQueried?: string[];
}

const TABLE_LABELS: Record<string, string> = {
  candidates: "求職者",
  companies: "企業",
  jobs: "求人",
  applications: "選考",
  interviews: "面接",
  resumes: "履歴書",
  candidate_memos: "メモ",
  candidate_status_histories: "ステータス履歴",
  contracts: "契約",
  memorandums: "覚書",
  invoices: "請求書",
  sales: "売上",
  schedules: "スケジュール",
  notifications: "通知",
  knowledge: "ナレッジ",
  users: "ユーザー",
  activity_logs: "操作ログ",
  follow_logs: "フォロー",
  diagnosis_hearings: "市場価値診断",
  message_templates: "テンプレート",
};

const SUGGESTION_QUESTIONS = [
  "今月の新規求職者は何名ですか？",
  "現在公開中の求人一覧を教えて",
  "選考中の求職者の状況を教えて",
  "直近の売上実績を教えて",
  "面接予定のスケジュールは？",
  "未読の通知はありますか？",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: json.data.reply,
            tablesQueried: json.data.tables_queried || [],
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
        { role: "assistant", content: "通信エラーが発生しました。再度お試しください。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (q: string) => {
    setInput(q);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
          style={{ background: "linear-gradient(135deg, #0048D9, #1B36AE)" }}
        >
          AI
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002D37" }}>
            AIチャットボット
          </h1>
          <p className="text-xs text-gray-500">
            Jobit CRM全データベースからAIが情報を検索・分析します
          </p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          全DB対応
        </span>
      </div>

      {/* チャットエリア */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl text-white"
              style={{ background: "linear-gradient(135deg, #0048D9, #1B36AE)" }}
            >
              AI
            </div>
            <p className="text-lg font-medium mb-1" style={{ color: "#002D37" }}>
              Jobit AIチャットボット
            </p>
            <p className="text-sm text-gray-500 mb-6">
              求職者・企業・求人・選考・売上・契約など、CRM内の全データについて質問できます
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
              {SUGGESTION_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-left text-sm bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-gray-600 hover:text-blue-700 px-3 py-2.5 rounded-lg border border-gray-200 transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "text-white"
                  : "bg-gray-50 text-gray-800 border border-gray-100"
              }`}
              style={
                msg.role === "user"
                  ? { background: "linear-gradient(135deg, #0048D9, #1B36AE)" }
                  : undefined
              }
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* 参照テーブル表示 */}
              {msg.tablesQueried && msg.tablesQueried.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">参照デージ:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.tablesQueried.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100"
                      >
                        {TABLE_LABELS[t] || t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>データベースを検索中...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="CRMデータについて質問してください..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #0048D9, #1B36AE)" }}
        >
          送信
        </button>
      </form>

      {/* セキュリティ注記 */}
      <p className="text-center text-xs text-gray-400 mt-2">
        全データはJobit CRM内部でのみ処理されます。外部へのデータ送信はありません。
      </p>
    </div>
  );
}
