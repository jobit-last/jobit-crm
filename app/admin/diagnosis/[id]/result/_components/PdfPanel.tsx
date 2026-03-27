"use client";

import { useState } from "react";

interface Props {
  hearingId: string;
  candidateName: string;
}

export default function PdfPanel({ hearingId, candidateName }: Props) {
  const pdfUrl = `/api/diagnosis/${hearingId}/pdf`;
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    const shareUrl = `${window.location.origin}${pdfUrl}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-gray-200"
        style={{ backgroundColor: "#F0F9FA" }}
      >
        <div className="flex items-center gap-2">
          {/* PDF icon */}
          <svg className="w-5 h-5" fill="none" stroke="#002D37" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "#002D37" }}>
            PDFレポート
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-600 hover:bg-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={showPreview ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
              />
            </svg>
            {showPreview ? "プレビューを閉じる" : "プレビュー"}
          </button>

          {/* Share link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-600 hover:bg-white transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">コピー完了</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                共有リンク
              </>
            )}
          </button>

          {/* Download */}
          <a
            href={pdfUrl}
            download={`AI診断レポート_${candidateName}.pdf`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00E05D", color: "#1A1A2E" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            PDFダウンロード
          </a>
        </div>
      </div>

      {/* PDF Preview (iframe) */}
      {showPreview && (
        <div className="border-t border-gray-200">
          <iframe
            src={pdfUrl}
            className="w-full"
            style={{ height: "720px", border: "none" }}
            title={`${candidateName} 様 AI診断レポート`}
          />
        </div>
      )}

      {/* Share URL display */}
      {copied && (
        <div className="px-6 py-3 border-t border-gray-200 bg-green-50">
          <p className="text-xs text-green-700">
            PDFの共有リンクをクリップボードにコピーしました
          </p>
          <p className="text-xs text-green-600 mt-0.5 break-all font-mono">
            {typeof window !== "undefined" ? `${window.location.origin}${pdfUrl}` : pdfUrl}
          </p>
        </div>
      )}
    </div>
  );
}
