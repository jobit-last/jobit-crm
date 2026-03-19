"use client";

import { useState } from "react";
import type { DiagnosisFormData } from "@/types/diagnosis";
import { INITIAL_FORM, STEP_LABELS } from "@/types/diagnosis";
import Step1Basic from "./Step1Basic";
import Step2Skills from "./Step2Skills";
import Step3Experience from "./Step3Experience";
import Step4Desired from "./Step4Desired";

export default function DiagnosisForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DiagnosisFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const TOTAL_STEPS = 4;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Certification handlers
  function handleCertificationChange(index: number, value: string) {
    setForm((prev) => {
      const certs = [...prev.certifications];
      certs[index] = value;
      return { ...prev, certifications: certs };
    });
  }

  function handleAddCertification() {
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ""],
    }));
  }

  function handleRemoveCertification(index: number) {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  }

  function handleManagementChange(value: boolean) {
    setForm((prev) => ({ ...prev, has_management: value }));
  }

  // Step 1 validation
  function validateStep(): boolean {
    if (step === 1 && !form.name.trim()) {
      setError("氏名を入力してください");
      return false;
    }
    setError(null);
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/diagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
      return;
    }

    setSavedId(json.data?.id ?? null);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Completion screen ──
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "#CCFBF1" }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="#0D9488"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "#1A1A2E" }}>
          ヒアリング完了
        </h2>
        <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
          {form.name} さんのヒアリング情報を保存しました。
        </p>
        <div className="flex flex-col items-center gap-3">
          {savedId && (
            <a
              href={`/admin/diagnosis/${savedId}/result`}
              className="px-6 py-2.5 rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#00E05D", color: "#1A1A2E" }}
            >
              AI診断結果を見る →
            </a>
          )}
          <div className="flex gap-3">
            <a
              href="/admin/diagnosis/new"
              onClick={() => {
                setForm(INITIAL_FORM);
                setStep(1);
                setSubmitted(false);
              }}
              className="px-5 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              続けて入力
            </a>
            <a
              href="/admin/candidates"
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#002D37" }}
            >
              求職者一覧へ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        {/* Step circles + connecting line */}
        <div className="relative flex items-start justify-between">
          {/* Background line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
          {/* Filled line */}
          <div
            className="absolute top-4 left-4 h-0.5 transition-all duration-500"
            style={{
              width: `calc(${((step - 1) / (TOTAL_STEPS - 1)) * 100}% - 0px)`,
              right: "auto",
              backgroundColor: "#00A0B0",
            }}
          />

          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isDone = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div
                key={i}
                className="relative flex flex-col items-center z-10"
                style={{ width: `${100 / TOTAL_STEPS}%` }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? "text-white"
                      : isActive
                      ? "text-white ring-4 ring-teal-100"
                      : "text-gray-400 bg-white border-2 border-gray-200"
                  }`}
                  style={
                    isDone
                      ? { backgroundColor: "#00A0B0" }
                      : isActive
                      ? { backgroundColor: "#002D37" }
                      : {}
                  }
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`mt-2 text-xs text-center leading-tight ${
                    isActive ? "font-semibold" : "font-normal"
                  }`}
                  style={{
                    color: isActive ? "#002D37" : isDone ? "#00A0B0" : "#9CA3AF",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Overall progress bar */}
        <div className="mt-5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(step / TOTAL_STEPS) * 100}%`,
              backgroundColor: "#00A0B0",
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            STEP {step} / {TOTAL_STEPS}
          </span>
          <span className="text-xs font-medium" style={{ color: "#00A0B0" }}>
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
      </div>

      {/* Step title */}
      <h2 className="text-lg font-semibold mb-5" style={{ color: "#1A1A2E" }}>
        {STEP_LABELS[step - 1]}
      </h2>

      {/* Step content */}
      {step === 1 && <Step1Basic data={form} onChange={handleChange} />}
      {step === 2 && (
        <Step2Skills
          data={form}
          onChange={handleChange}
          onCertificationChange={handleCertificationChange}
          onAddCertification={handleAddCertification}
          onRemoveCertification={handleRemoveCertification}
        />
      )}
      {step === 3 && (
        <Step3Experience
          data={form}
          onChange={handleChange}
          onManagementChange={handleManagementChange}
        />
      )}
      {step === 4 && <Step4Desired data={form} onChange={handleChange} />}

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-md text-sm bg-red-50 text-red-600">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pb-8">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  step === i + 1
                    ? "#002D37"
                    : step > i + 1
                    ? "#00A0B0"
                    : "#E5E7EB",
              }}
            />
          ))}
        </div>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#002D37" }}
          >
            次へ
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#00A0B0" }}
          >
            {submitting ? (
              "保存中..."
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ヒアリング完了
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
