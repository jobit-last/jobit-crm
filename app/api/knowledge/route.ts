import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from "@/types/knowledge";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const q        = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const tag      = searchParams.get("tag") || "";
    const page     = parseInt(searchParams.get("page") || "1", 10);
    const per_page = parseInt(searchParams.get("per_page") || "20", 10);

    let query = supabase
      .from("knowledge")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (q)        query = query.ilike("title", `%${q}%`);
    if (category) query = query.eq("category", category);
    if (tag)      query = query.contains("tags", [tag]);

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: [], message: error.message, meta: {} },
        { status: 500 }
      );
    }

    const total = count || 0;
    return NextResponse.json({
      success: true,
      data: data || [],
      message: "",
      meta: { total, page, per_page, total_pages: Math.ceil(total / per_page) },
    });
  } catch {
    return NextResponse.json(
      { success: false, data: [], message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { title, content, category, tags } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { success: false, data: null, message: "タイトルは必須です", meta: {} },
        { status: 400 }
      );
    }

    const safeCategory =
      category && KNOWLEDGE_CATEGORIES.includes(category as KnowledgeCategory)
        ? category
        : null;

    const safeTags = Array.isArray(tags)
      ? tags.filter((t): t is string => typeof t === "string" && t.trim() !== "")
      : [];

    const { data, error } = await supabase
      .from("knowledge")
      .insert({
        title: title.trim(),
        content: content || null,
        category: safeCategory,
        tags: safeTags,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: "ナレッジを登録しました", meta: {} },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
