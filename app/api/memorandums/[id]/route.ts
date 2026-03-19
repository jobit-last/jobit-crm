import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("memorandums")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, data: null, message: "覚書が見つかりません", meta: {} },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { company_id, contract_id, title, content, status, signed_date, file_url } = body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return NextResponse.json(
        { success: false, data: null, message: "タイトルは必須です", meta: {} },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (company_id !== undefined) updateData.company_id = company_id || null;
    if (contract_id !== undefined) updateData.contract_id = contract_id || null;
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content || null;
    if (status !== undefined) updateData.status = status;
    if (signed_date !== undefined) updateData.signed_date = signed_date || null;
    if (file_url !== undefined) updateData.file_url = file_url || null;

    const { data, error } = await supabase
      .from("memorandums")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("update", `覚書更新: ${data.title ?? id}`);
    return NextResponse.json({ success: true, data, message: "更新しました", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase.from("memorandums").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, data: null, message: error.message, meta: {} },
        { status: 500 }
      );
    }

    await recordLog("delete", `覚書削除: ${id}`);
    return NextResponse.json({ success: true, data: null, message: "削除しました", meta: {} });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
