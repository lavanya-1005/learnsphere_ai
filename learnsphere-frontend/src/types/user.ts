export type UserRole = "student" | "instructor" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  kyc_status: string;
  kyc_document_url?: string | null;
  created_at: string;
};