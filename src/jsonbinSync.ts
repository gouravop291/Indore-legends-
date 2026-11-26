const BIN_ID = "6b086cbaf735607f31b6189e";
const API_KEY = "$2a$10$PspzK6mvddu3vcOWc9BHz.p3cNhdC5If0PZAFGRU5M8tCAYDSrh1q";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export async function loadBinState<T>(): Promise<T | null> {
  try {
    const res = await fetch(`${BIN_URL}/latest`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.record ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function saveBinState<T>(data: T): Promise<boolean> {
  try {
    const res = await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function mergeBinWithLocalState<T extends Record<string, any>>(
  prev: T,
  cloudData: Partial<T> | null | undefined
): T {
  if (!cloudData || typeof cloudData !== "object") return prev;

  const cloudWorkspaces = (cloudData as any).workspaces || {};
  const prevWorkspaces = (prev as any).workspaces || {};

  return {
    ...prev,
    ...cloudData,
    customPasswords:
      (cloudData as any).customPasswords ?? (prev as any).customPasswords,
    workspaces: {
      ...prevWorkspaces,
      il: {
        ...(prevWorkspaces.il || {}),
        ...(cloudWorkspaces.il || {}),
        players:
          Array.isArray(cloudWorkspaces.il?.players) &&
          cloudWorkspaces.il.players.length > 0
            ? cloudWorkspaces.il.players
            : prevWorkspaces.il?.players || [],
        messages: prevWorkspaces.il?.messages || [],
      },
      gm: {
        ...(prevWorkspaces.gm || {}),
        ...(cloudWorkspaces.gm || {}),
        players:
          Array.isArray(cloudWorkspaces.gm?.players) &&
          cloudWorkspaces.gm.players.length > 0
            ? cloudWorkspaces.gm.players
            : prevWorkspaces.gm?.players || [],
        messages: prevWorkspaces.gm?.messages || [],
      },
    },
  };
}
