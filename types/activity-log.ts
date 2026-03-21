export type LogAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete";

export interface ActivityLog {
  id: string;
  user_id: string;
  action: LogAction;
  target: string;
  ip_address: string | null;
  created_at: string;
  // joined
  user_name?: string;
  user_email?: string;
}
