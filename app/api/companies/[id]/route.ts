import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, data: null, message: "企業が見つかりません", meta: {} },
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

    const { name, industry, company_size, location, website,
            contact_name, contact_email, contact_phone, temperature, notes } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      return NextResponse.json(
        { success: false, data: null, message: "企業名は必須です", meta: {} },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (industry !== undefined) updateData.industry = industry || null;
    if (company_size !== undefined) updateData.company_size = company_size || null;
    if (location !== undefined) updateData.location = location || null;
    if (website !== undefined) updateData.website = website || null;
    if (contact_name !== undefined) updateData.contact_name = contact_name || null;
    if (contact_email !== undefined) updateData.contact_email = contact_email || null;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone || null;
    if (temperature !== undefined) updateData.temperature = temperature || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const { data, error } = await supabase
      .from("companies")
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

    const { error } = await supabase.from("companies").delete().eq("id", id);

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
