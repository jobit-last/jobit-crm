"use server";

import { createClient } from "@/lib/supabase/server";
import { recordLog } from "@/lib/activity-log";

export type ApiResponse<T = null> = {
  success: boolean;
  data: T;
  message: string;
};

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<{ userId: string } | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }

  await recordLog("login", `ユーザーログイン: ${email}`);

  return {
    success: true,
    data: { userId: data.user.id },
    message: "ログインに成功しました",
  };
}

export async function signOut(): Promise<ApiResponse> {
  const supabase = await createClient();

  await recordLog("logout", "ユーザーログアウト");

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }

  return {
    success: true,
    data: null,
    message: "ログアウトしました",
  };
}
