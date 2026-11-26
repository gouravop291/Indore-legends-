// src/clubSync.ts
// Real-time Firestore cloud state sync (zero external npm packages needed for Vercel builds)

import { firebaseConfig } from "./firebaseChat";

export interface CloudStateEnvelope<T> {
  data: T;
  updatedAtMs: number;
  clientId: string;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
}

interface FirestoreDocument {
  fields?: Record<string, FirestoreValue>;
  error?: {
    code?: number;
    message?: string;
  };
}

const DOC_URL =
  "https://firestore.googleapis.com/v1/projects/" +
  firebaseConfig.projectId +
  "/databases/(default)/documents/indore_legends_sync/club_state_v1";

const CLIENT_ID =
  "client_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);

let lastAppliedMs = 0;
let isWriting = false;
let writeQueue: Promise<void> = Promise.resolve();

export async function fetchCloudClubState<T>(): Promise<CloudStateEnvelope<T> | null> {
  const url = DOC_URL + "?key=" + encodeURIComponent(firebaseConfig.apiKey);

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    let errText = "HTTP " + res.status;
    try {
      const errJson = (await res.json()) as FirestoreDocument;
      if (errJson.error?.message) errText = errJson.error.message;
    } catch {
      // ignore parse error
    }
    throw new Error(errText);
  }

  const doc = (await res.json()) as FirestoreDocument;
  const rawPayload = doc.fields?.payload?.stringValue;
  if (!rawPayload) return null;

  const updatedAtMs = Number(doc.fields?.updatedAtMs?.integerValue || "0") || 0;
  const clientId = doc.fields?.clientId?.stringValue || "";

  const parsed = JSON.parse(rawPayload) as T;
  return { data: parsed, updatedAtMs, clientId };
}

export function saveCloudClubState<T>(
  data: T,
  onStatus?: (status: "Saving..." | "Live Cloud" | "Sync Error") => void
): Promise<void> {
  const updatedAtMs = Math.max(Date.now(), lastAppliedMs + 1);
  lastAppliedMs = updatedAtMs;

  writeQueue = writeQueue.then(async () => {
    isWriting = true;
    if (onStatus) onStatus("Saving...");

    try {
      const url = DOC_URL + "?key=" + encodeURIComponent(firebaseConfig.apiKey);
      const body = {
        fields: {
          payload: { stringValue: JSON.stringify(data) },
          updatedAtMs: { integerValue: String(updatedAtMs) },
          clientId: { stringValue: CLIENT_ID },
        },
      };

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      if (onStatus) onStatus("Live Cloud");
    } catch {
      if (onStatus) onStatus("Sync Error");
    } finally {
      isWriting = false;
    }
  });

  return writeQueue;
}

export function subscribeClubState<T>(
  onUpdate: (data: T) => void,
  onStatus?: (status: "Live Cloud" | "Cloud Ready" | "Offline") => void
): () => void {
  let active = true;
  let inFlight = false;

  const pullNow = async () => {
    if (!active || inFlight || isWriting) return;
    inFlight = true;
    try {
      const env = await fetchCloudClubState<T>();
      if (!active) return;

      if (!env) {
        if (onStatus) onStatus("Cloud Ready");
        return;
      }

      if (onStatus) onStatus("Live Cloud");

      if (env.updatedAtMs <= lastAppliedMs) return;
      if (env.clientId === CLIENT_ID) {
        lastAppliedMs = env.updatedAtMs;
        return;
      }

      lastAppliedMs = env.updatedAtMs;
      onUpdate(env.data);
    } catch {
      if (active && onStatus) onStatus("Offline");
    } finally {
      inFlight = false;
    }
  };

  void pullNow();

  const intervalId = window.setInterval(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    void pullNow();
  }, 2500);

  const handleResume = () => {
    if (typeof document !== "undefined" && document.hidden) return;
    void pullNow();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("focus", handleResume);
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleResume);
  }

  return () => {
    active = false;
    window.clearInterval(intervalId);
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", handleResume);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleResume);
    }
  };
}
