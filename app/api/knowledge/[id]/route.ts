import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from "@/types/knowledge";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("knowledge")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, data: null, message: "ナレッジが見つかりません", meta: {} },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data, message: "", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { id } = await params;
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
      .update({
        title: title.trim(),
        content: content || null,
        category: safeCategory,
        tags: safeTags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data, message: "更新しました", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("knowledge").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: null, message: "削除しました", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
