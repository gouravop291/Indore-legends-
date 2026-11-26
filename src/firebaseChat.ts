// src/firebaseChat.ts
// Real-time Firestore locker-room chat client (zero external npm packages needed for Vercel builds)

export const firebaseConfig = {
  apiKey: "AIzaSyDwYVYATOjbMtdIMxbNATugNl2lrxho6cY",
  authDomain: "indore-legends.firebaseapp.com",
  projectId: "indore-legends",
  storageBucket: "indore-legends.firebasestorage.app",
  messagingSenderId: "963369743426",
  appId: "1:963369743426:web:2ea153a6b629944d5a69db",
  measurementId: "G-Z5E3V2EWSQ",
} as const;

export type ChatWorkspace = "il" | "gm";

export interface CloudChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  workspace: ChatWorkspace;
  createdAtMs: number;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
}

interface FirestoreDocument {
  name?: string;
  createTime?: string;
  fields?: Record<string, FirestoreValue>;
}

interface FirestoreListResponse {
  documents?: FirestoreDocument[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

const COLLECTION_NAME = "locker_room_chat";
const BASE_URL =
  "https://firestore.googleapis.com/v1/projects/" +
  firebaseConfig.projectId +
  "/databases/(default)/documents/" +
  COLLECTION_NAME;

function readStringField(
  fields: Record<string, FirestoreValue> | undefined,
  key: string,
  fallback = ""
): string {
  const val = fields?.[key];
  if (!val) return fallback;
  if (typeof val.stringValue === "string") return val.stringValue;
  return fallback;
}

function readNumberField(
  fields: Record<string, FirestoreValue> | undefined,
  key: string,
  fallback = 0
): number {
  const val = fields?.[key];
  if (!val) return fallback;
  if (typeof val.integerValue === "string") {
    const parsed = Number(val.integerValue);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof val.doubleValue === "number" && Number.isFinite(val.doubleValue)) {
    return val.doubleValue;
  }
  if (typeof val.timestampValue === "string") {
    const ms = Date.parse(val.timestampValue);
    return Number.isFinite(ms) ? ms : fallback;
  }
  return fallback;
}

function extractDocId(fullName: string | undefined): string {
  if (!fullName) return "msg_" + Math.random().toString(36).slice(2, 9);
  const parts = fullName.split("/");
  return parts[parts.length - 1] || fullName;
}

function parseDocument(doc: FirestoreDocument): CloudChatMessage | null {
  const fields = doc.fields;
  if (!fields) return null;

  const text = readStringField(fields, "text").trim();
  if (!text) return null;

  const rawWorkspace = readStringField(fields, "workspace", "il");
  const workspace: ChatWorkspace = rawWorkspace === "gm" ? "gm" : "il";

  const fallbackTime = doc.createTime ? Date.parse(doc.createTime) : 0;
  const createdAtMs =
    readNumberField(fields, "createdAtMs", 0) ||
    readNumberField(fields, "createdAt", 0) ||
    (Number.isFinite(fallbackTime) ? fallbackTime : 0);

  const formattedFallbackTime =
    createdAtMs > 0
      ? new Date(createdAtMs).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return {
    id: extractDocId(doc.name),
    sender: readStringField(fields, "sender", "Squad Member"),
    text,
    timestamp: readStringField(fields, "timestamp", formattedFallbackTime),
    workspace,
    createdAtMs,
  };
}

export async function fetchLockerMessages(
  workspaceKey: ChatWorkspace
): Promise<CloudChatMessage[]> {
  const url =
    BASE_URL +
    "?pageSize=200&key=" +
    encodeURIComponent(firebaseConfig.apiKey);

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    let errText = "HTTP " + res.status;
    try {
      const errJson = (await res.json()) as FirestoreListResponse;
      if (errJson.error?.message) errText = errJson.error.message;
    } catch {
      // ignore parse error
    }
    throw new Error(errText);
  }

  const data = (await res.json()) as FirestoreListResponse;
  const docs = Array.isArray(data.documents) ? data.documents : [];

  const parsed: CloudChatMessage[] = [];
  for (let i = 0; i < docs.length; i += 1) {
    const item = parseDocument(docs[i]);
    if (item && item.workspace === workspaceKey) {
      parsed.push(item);
    }
  }

  parsed.sort((a, b) => {
    if (a.createdAtMs !== b.createdAtMs) return a.createdAtMs - b.createdAtMs;
    return a.id.localeCompare(b.id);
  });

  return parsed.slice(-150);
}

export function subscribeLockerChat(
  workspaceKey: ChatWorkspace,
  onUpdate: (messages: CloudChatMessage[]) => void,
  onError?: (errorMessage: string) => void
): () => void {
  let active = true;
  let inFlight = false;

  const syncNow = async () => {
    if (!active || inFlight) return;
    inFlight = true;
    try {
      const list = await fetchLockerMessages(workspaceKey);
      if (active) {
        onUpdate(list);
      }
    } catch (err) {
      if (active && onError) {
        const msg = err instanceof Error ? err.message : "Sync failed";
        onError(msg);
      }
    } finally {
      inFlight = false;
    }
  };

  void syncNow();

  const intervalId = window.setInterval(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    void syncNow();
  }, 2500);

  const handleFocusOrVisible = () => {
    if (typeof document !== "undefined" && document.hidden) return;
    void syncNow();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("focus", handleFocusOrVisible);
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleFocusOrVisible);
  }

  return () => {
    active = false;
    window.clearInterval(intervalId);
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", handleFocusOrVisible);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    }
  };
}

export async function sendCloudLockerMessage(params: {
  workspace: ChatWorkspace;
  sender: string;
  text: string;
  timestamp: string;
}): Promise<CloudChatMessage> {
  const cleanText = params.text.trim();
  const createdAtMs = Date.now();
  if (!cleanText) {
    throw new Error("Empty message");
  }

  const url =
    BASE_URL + "?key=" + encodeURIComponent(firebaseConfig.apiKey);

  const payload = {
    fields: {
      workspace: { stringValue: params.workspace },
      sender: { stringValue: params.sender || "Squad Member" },
      text: { stringValue: cleanText },
      timestamp: { stringValue: params.timestamp },
      createdAtMs: { integerValue: String(createdAtMs) },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errText = "HTTP " + res.status;
    try {
      const errJson = (await res.json()) as FirestoreListResponse;
      if (errJson.error?.message) errText = errJson.error.message;
    } catch {
      // ignore parse error
    }
    throw new Error(errText);
  }

  const savedDoc = (await res.json()) as FirestoreDocument;
  const parsed = parseDocument(savedDoc);

  return (
    parsed || {
      id: extractDocId(savedDoc.name),
      workspace: params.workspace,
      sender: params.sender,
      text: cleanText,
      timestamp: params.timestamp,
      createdAtMs,
    }
  );
}
