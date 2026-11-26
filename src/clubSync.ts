import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface ClubState {
  matches?: any[];
  players?: any[];
  adminIds?: string[];
  badges?: Record<string, string[]>;
  prompts?: any[];
  treasury?: any[];
  updatedAt?: number;
}

const CLUB_DOC_REF = doc(db, "indoreLegends", "clubState");

// Listens for live changes across all phones 24/7
export function subscribeToClubState(
  onUpdate: (data: ClubState) => void
) {
  return onSnapshot(CLUB_DOC_REF, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data() as ClubState);
    }
  });
}

// Saves any change (matches, admins, badges, prompts) to Firebase
// Uses merge: true so it creates the document automatically on first save
export async function saveClubState(partialData: Partial<ClubState>) {
  await setDoc(
    CLUB_DOC_REF,
    {
      ...partialData,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}
