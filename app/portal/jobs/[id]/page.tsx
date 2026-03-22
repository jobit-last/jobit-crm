"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Job } from "@/types/job";
import Spinner from "@/components/Spinner";

const ACCENT = "#2394FF";
const GRADIENT_B = "linear-gradient(135deg, #16B1F3, #0649C4)";
const GRADIENT_O = "linear-gradient(135deg, #EE542F, #F67A34, #FFA639)";

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "応相談";
  if (min && max) return `${(min / 10000).toFixed(0)}〜${(max / 10000).toFixed(0)}万円`;
  if (min) return `${(min / 10000).toFixed(0)}万円〜`;
  return `〜${(max! / 10000).toFixed(0)}万円`;
}

interface CompanyDetail {
  id: string;
  name: string;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  website: string | null;
}

export default function PortalJobDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const [job, setJob]           = useState<Job | null>(null);
  const [company, setCompany]   = useState<CompanyDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [interested, setInterested] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sending, setSending]   = useState(false);
  const [sentMsg, setSentMsg]   = useState("");

  const fetchJob = useCallback(async () => {
    try {
      const res  = await fetch(`/api/jobs/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) { setNotFound(true); return; }
      setJob(json.data);

      if (json.data.company_id) {
        const cRes  = await fetch(`/api/companies/${json.data.company_id}`);
        const cJson = await cRes.json();
        if (cJson.success) setCompany(cJson.data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
    // お気に入り状態を復元
    try {
      const saved = localStorage.getItem("portal_favorites");
      if (saved) setIsFavorite(new Set(JSON.parse(saved)).has(id));
    } catch {}
  }, [fetchJob, id]);

  const toggleFavorite = () => {
    try {
      const saved = localStorage.getItem("portal_favorites");
      const set   = new Set<string>(saved ? JSON.parse(saved) : []);
      isFavorite ? set.delete(id) : set.add(id);
      localStorage.setItem("portal_favorites", JSON.stringify([...set]));
      setIsFavorite(!isFavorite);
    } catch {}
  };

  const handleInterest = async () => {
    setSending(true);
    // 実際のAPIがあれば呼び出す
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setInterested(true);
    setSentMsg("担当CAに通知しました。近日中にご連絡いたします。");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-4 bg-gray-100 rounded w-24" />
        <div className="h-8 bg-gray-100 rounded w-2/3" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: GRADIENT_B }}
        >
          <span className="text-3xl text-white">🔍</span>
        </div>
        <p className="mb-4 text-gray-500">求人が見つかりませんでした</p>
        <Link href="/portal/jobs" className="text-sm underline" style={{ color: ACCENT }}>
          求人一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F2F6FF", minHeight: "100vh" }}>
      {/* ヘッダー with gradient */}
      <div style={{ background: GRADIENT_B }} className="py-8 sm:py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* パンくず */}
          <div className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/portal/jobs" className="hover:underline text-white/80">
              求人一覧
            </Link>
            <span>/</span>
            <span className="text-white truncate">{job.title}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-blue-100 mb-1">{job.company_name ?? "企業名未設定"}</p>
              <h1 className="text-2xl font-bold leading-snug text-white">
                {job.title}
              </h1>
            </div>
            <button
              onClick={toggleFavorite}
              aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
              className="shrink-0 text-3xl transition-transform hover:scale-110"
            >
              {isFavorite ? (
                <span style={{ color: "#FF4D6D" }}>♥</span>
              ) : (
                <span className="text-white/40 hover:text-white/60">♡</span>
              )}
            </button>
          </div>

          {/* バッジ */}
          <div className="flex flex-wrap gap-2 mt-4">
            {job.job_type && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-white/20 text-white">
                {job.job_type}
              </span>
            )}
            {job.location && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white">
                📍 {job.location}
              </span>
            )}
            <span
              className="text-xs px-3 py-1.5 rounded-full font-bold text-white"
              style={{ background: GRADIENT_O }}
            >
              💰 {formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* メインカード */}
        <div
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          style={{ borderLeft: `4px solid ${ACCENT}` }}
        >
          {/* 仕事内容 */}
          {job.description && (
            <section className="mb-6">
              <h2 className="text-sm font-bold mb-2" style={{ color: "#16B1F3" }}>仕事内容</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </section>
          )}

          {/* 求めるスキル */}
          {job.required_skills && (
            <section className="mb-6">
              <h2 className="text-sm font-bold mb-2" style={{ color: "#16B1F3" }}>求めるスキル・経験</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {job.required_skills}
              </p>
            </section>
          )}

          {/* 詳細情報テーブル */}
          <section>
            <h2 className="text-sm font-bold mb-3" style={{ color: "#16B1F3" }}>募集要項</h2>
            <dl className="divide-y divide-gray-50">
              {[
                { label: "職種",   value: job.job_type },
                { label: "勤務地", value: job.location },
                { label: "年収",   value: formatSalary(job.salary_min, job.salary_max), highlight: true },
              ].map(({ label, value, highlight }) =>
                value ? (
                  <div key={label} className="flex py-2.5 gap-4 text-sm">
                    <dt className="w-24 shrink-0 text-gray-400">{label}</dt>
                    <dd
                      className={highlight ? "font-bold" : "text-gray-700"}
                      style={highlight ? {
                        background: GRADIENT_O,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      } : undefined}
                    >
                      {value}
                    </dd>
                  </div>
                ) : null
              )}
            </dl>
          </section>
        </div>

        {/* 企業情報カード */}
        {company && (
          <div
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
            style={{ borderLeft: `4px solid ${ACCENT}` }}
          >
            <h2 className="text-sm font-bold mb-4" style={{ color: "#16B1F3" }}>企業情報</h2>
            <dl className="divide-y divide-gray-50">
              {[
                { label: "企業名",   value: company.name },
                { label: "業種",     value: company.industry },
                { label: "従業員数", value: company.company_size },
                { label: "所在地",   value: company.location },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex py-2.5 gap-4 text-sm">
                    <dt className="w-24 shrink-0 text-gray-400">{label}</dt>
                    <dd className="text-gray-700">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-xs underline hover:opacity-70"
                style={{ color: ACCENT }}
              >
                企業Webサイトを見る →
              </a>
            )}
          </div>
        )}

        {/* 興味あり CTA */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center" style={{ borderTop: `4px solid #16B1F3` }}>
          {interested ? (
            <div>
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-semibold mb-1" style={{ color: "#21242B" }}>
                ありがとうございます！
              </p>
              <p className="text-sm text-gray-500">{sentMsg}</p>
              <Link
                href="/portal/jobs"
                className="inline-block mt-4 text-sm underline hover:opacity-70"
                style={{ color: ACCENT }}
              >
                ほかの求人を見る
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                この求人が気になったら担当CAに伝えましょう
              </p>
              <button
                onClick={handleInterest}
                disabled={sending}
                className="w-full sm:w-auto px-10 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-80 disabled:opacity-50 shadow-lg"
                style={{ background: GRADIENT_B }}
              >
                {sending ? <><Spinner size={16} className="inline mr-1.5" />送信中...</> : "この求人に興味あり"}
              </button>
              <p className="text-xs text-gray-400 mt-2">担当CAに通知が届きます</p>
            </div>
          )}
        </div>

        {/* 戻るリンク */}
        <div className="text-center mt-8">
          <Link
            href="/portal/jobs"
            className="text-sm hover:underline"
            style={{ color: ACCENT }}
          >
            ← 求人一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
