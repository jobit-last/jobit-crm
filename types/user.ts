export type UserRole = "admin" | "ca";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ld_login_id: string | null;
  created_at: string;
}

export type UserInsert = Omit<User, "id" | "created_at" | "ld_login_id">;
export type UserUpdate = Partial<UserInsert>;
