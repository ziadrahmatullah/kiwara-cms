// Tipe kontrak API wedding-be untuk Kiwara CMS.
// Sumber kebenaran: docs/backend-prompt-kiwara-cms.md.

export type Role = "admin" | "user";
export type ImageLayout = "single" | "strip";
export type LinkedFilter = "all" | "linked" | "orphan";
/** Scope event yang aktif di panel: id event, semua event, atau baris tanpa event. */
export type EventScope = number | "all" | "none";

export interface ApiEnvelope<T> {
  message?: string;
  data: T;
  current_page?: number;
  current_item?: number;
  total_page?: number;
  total_item?: number;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
}

export interface Pagination {
  current_page: number;
  total_page: number;
  total_item: number;
  current_item: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

// ---------- Event ----------
export interface EventRef {
  id: number;
  slug: string;
  name: string;
}

export interface Event extends EventRef {
  bride_name: string | null;
  groom_name: string | null;
  event_date: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventPayload {
  slug: string;
  name: string;
  bride_name: string;
  groom_name: string;
  event_date: string | null;
  is_active: boolean;
}

export interface EventListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

// ---------- Auth ----------
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  event_id: number | null;
  event: EventRef | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthUser {
  token: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

// ---------- Guestbook ----------
export interface GuestbookImage {
  id: number;
  layout: ImageLayout;
  image_link: string;
  image_links: string[] | null;
  framed_image_link: string | null;
  order: number;
  created_at: string;
}

export interface GuestbookImageRow extends GuestbookImage {
  guestbook_message_id: number | null;
  guestbook_message: { id: number; fullname: string } | null;
  event: EventRef | null;
}

export interface GuestbookMessage {
  id: number;
  fullname: string;
  message: string | null;
  voice_link: string | null;
  created_at: string;
  event: EventRef | null;
  images: GuestbookImage[];
}

export interface DailyStat {
  date: string;
  messages: number;
  images: number;
}

export interface GuestbookStats {
  total_messages: number;
  total_images: number;
  total_single: number;
  total_strip: number;
  total_with_voice: number;
  total_orphan_images: number;
  daily: DailyStat[];
}

export interface ScopeParams {
  event_id?: number | "none";
}

export interface GuestbookMessageParams extends ScopeParams {
  page?: number;
  limit?: number;
  search?: string;
  has_photo?: boolean;
  has_voice?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface GuestbookImageParams extends ScopeParams {
  page?: number;
  limit?: number;
  layout?: ImageLayout;
  linked?: LinkedFilter;
  search?: string;
}

// ---------- User ----------
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  event_id: number | null;
  event: EventRef | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  event_id: number | null;
  is_active: boolean;
}

export type UserUpdatePayload = Omit<UserCreatePayload, "password">;

export interface ResetPasswordPayload {
  new_password: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  event_id?: number | "none";
}
