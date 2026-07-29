// Player profile cosmetics: the default avatar icon and the preset frame styles
// selectable from the profile popup. Frames are freely selectable (not gated by
// any unlock system) since they are purely a player-level cosmetic, distinct
// from the per-creature flair system in data/flair.js.

export const DEFAULT_AVATAR = "🧑‍✈️";

export const FRAME_OPTIONS = [
  { id: "none", label: "None", border: "2px solid #e0e0e0", shadow: "none" },
  { id: "gold", label: "Gold", border: "3px solid #f5c518", shadow: "0 0 8px rgba(245,197,24,0.6)" },
  { id: "silver", label: "Silver", border: "3px solid #c0c0c0", shadow: "0 0 8px rgba(192,192,192,0.6)" },
  { id: "fire", label: "Fire", border: "3px solid #ff5722", shadow: "0 0 10px rgba(255,87,34,0.7)" },
  { id: "ice", label: "Ice", border: "3px solid #4fc3f7", shadow: "0 0 10px rgba(79,195,247,0.7)" },
  { id: "nature", label: "Nature", border: "3px solid #66bb6a", shadow: "0 0 8px rgba(102,187,106,0.6)" },
  { id: "shadow", label: "Shadow", border: "3px solid #4a148c", shadow: "0 0 10px rgba(74,20,140,0.7)" },
  { id: "rainbow", label: "Rainbow", border: "3px solid transparent", borderImage: "linear-gradient(90deg,#ff0000,#ff9800,#ffeb3b,#4caf50,#2196f3,#9c27b0) 1", shadow: "0 0 10px rgba(0,0,0,0.15)" },
];

export const FRAME_MAP = Object.fromEntries(FRAME_OPTIONS.map((f) => [f.id, f]));
