import { getPagedItems, http } from "@/lib/api/client";
import type { EmailMessage, MessageStatus, PushMessage } from "@/lib/types";
import type { EnumItem } from "@/lib/api/services/users";

/**
 * Outbound messaging: transactional e-mails (`/v1/emails`) and push
 * notifications (`/v1/pushs`). Both are read-only feeds the backend fills when
 * it sends something — useful for "did the reset e-mail actually go out?".
 */

function toStatus(item?: EnumItem | null): MessageStatus {
  const name = item?.name ?? "";
  if (name === "Sent") return "sent";
  if (name === "Error") return "error";
  return "other";
}

interface EmailMessageDto {
  id: string;
  createdAt: string;
  toEmail: string;
  subject: string;
  messages: string;
  status?: EnumItem;
  template?: EnumItem;
}

function mapEmail(d: EmailMessageDto): EmailMessage {
  return {
    id: d.id,
    createdAt: d.createdAt,
    toEmail: d.toEmail,
    subject: d.subject,
    body: d.messages ?? "",
    status: toStatus(d.status),
    statusLabel: d.status?.displayName || d.status?.name || "—",
    templateLabel: d.template?.displayName || d.template?.name || "—",
  };
}

export interface EmailFilters {
  search?: string;
  /** API enum names: Sent | Error, CreatedAccount | ForgetPassword. */
  status?: string;
  template?: string;
}

export const emailsService = {
  async list(f: EmailFilters = {}): Promise<EmailMessage[]> {
    const dtos = await getPagedItems<EmailMessageDto>("/v1/emails", {
      Search: f.search,
      Status: f.status,
      Template: f.template,
    });
    return dtos.map(mapEmail).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  get(id: string): Promise<EmailMessage> {
    return http.get<EmailMessageDto>(`/v1/emails/${id}`).then(mapEmail);
  },

  /** Statuses + templates for the filter dropdowns. */
  async meta(): Promise<{ statuses: EnumItem[]; templates: EnumItem[] }> {
    const [s, t] = await Promise.all([
      http.get<{ emailStatuses: EnumItem[] }>("/v1/emails/statuses"),
      http.get<{ emailTemplates: EnumItem[] }>("/v1/emails/templates"),
    ]);
    return { statuses: s?.emailStatuses ?? [], templates: t?.emailTemplates ?? [] };
  },
};

/* ---- Push notifications ------------------------------------------ */

interface PushMessageDto {
  id: string;
  createdAt: string;
  userId: string | null;
  title: string;
  body: string;
  status?: EnumItem;
  template?: EnumItem;
  isReaded: boolean;
}

function mapPush(d: PushMessageDto): PushMessage {
  return {
    id: d.id,
    createdAt: d.createdAt,
    userId: d.userId ?? null,
    title: d.title ?? "",
    body: d.body ?? "",
    status: toStatus(d.status),
    statusLabel: d.status?.displayName || d.status?.name || "—",
    templateLabel: d.template?.displayName || d.template?.name || "—",
    read: !!d.isReaded,
  };
}

export interface PushFilters {
  search?: string;
  /** Client-side: the API has no read/unread filter. */
  read?: "all" | "read" | "unread";
}

export const pushService = {
  async list(f: PushFilters = {}): Promise<PushMessage[]> {
    const dtos = await getPagedItems<PushMessageDto>("/v1/pushs", { Search: f.search });
    let out = dtos.map(mapPush).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (f.read === "read") out = out.filter((p) => p.read);
    if (f.read === "unread") out = out.filter((p) => !p.read);
    return out;
  },

  get(id: string): Promise<PushMessage> {
    return http.get<PushMessageDto>(`/v1/pushs/${id}`).then((d) => mapPush({ ...d, id }));
  },

  markRead(id: string): Promise<void> {
    return http.put<void>(`/v1/pushs/${id}/read`);
  },

  /** Registers this device's push token against the signed-in account. */
  registerDevice(token: string): Promise<void> {
    return http.post<void>("/v1/pushs/register", { token: token.trim() });
  },

  async meta(): Promise<{ statuses: EnumItem[]; templates: EnumItem[] }> {
    const [s, t] = await Promise.all([
      http.get<{ pushStatuses: EnumItem[] }>("/v1/pushs/push-statuses"),
      http.get<{ pushTemplates: EnumItem[] }>("/v1/pushs/push-templates"),
    ]);
    return { statuses: s?.pushStatuses ?? [], templates: t?.pushTemplates ?? [] };
  },
};
