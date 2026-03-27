export type UserRole = "admin" | "ca";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type UserInsert = Omit<User, "id" | "created_at">;
export type UserUpdate = Partial<UserInsert>;
