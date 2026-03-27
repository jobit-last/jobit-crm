"use client";

import { useState, useEffect } from "react";

// =============================================
// お気に入り
// =============================================
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("portal_favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("portal_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const getIds = (): string[] => {
    try {
      const saved = localStorage.getItem("portal_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  return { favorites, toggle, getIds };
}

// =============================================
// 比較リスト (最大3件)
// =============================================
export const COMPARE_MAX = 3;

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("portal_compare");
      if (saved) setCompareIds(JSON.parse(saved));
    } catch {}
  }, []);

  const add = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id) || prev.length >= COMPARE_MAX) return prev;
      const next = [...prev, id];
      localStorage.setItem("portal_compare", JSON.stringify(next));
      return next;
    });
  };

  const remove = (id: string) => {
    setCompareIds((prev) => {
      const next = prev.filter((v) => v !== id);
      localStorage.setItem("portal_compare", JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setCompareIds([]);
    localStorage.removeItem("portal_compare");
  };

  return { compareIds, add, remove, clear };
}
