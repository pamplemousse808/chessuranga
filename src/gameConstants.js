export const SHARED_DECK = [
  // Tier 1
  { id: "RAHU",    name: "Rahu",    color: "#9333ea", radius: 3, tier: 1, cost: 7,  description: "Pass through pieces for 2 moves",                         image: "/images/rahu.jpg"    },
  { id: "KETU",    name: "Ketu",    color: "#f97316", radius: 3, tier: 1, cost: 8,  description: "When captured: +12s you, -12s opponent",                  image: "/images/ketu.jpg"    },
  { id: "SURYA",   name: "Surya",   color: "#fbbf24", radius: 2, tier: 1, cost: 8,  description: "Can't be captured for 2 moves",                           image: "/images/surya.jpg"   },
  // Tier 2
  { id: "CHANDRA", name: "Chandra", color: "#e5e7eb", radius: 2, tier: 2, cost: 10, description: "Place 1-2 clones on rank (2nd = +5s)",                    image: "/images/chandra.jpg" },
  { id: "GURU",    name: "Guru",    color: "#a855f7", radius: 2, tier: 2, cost: 9,  description: "Resurrect a piece where it died, but it can't move immediately", image: "/images/guru.jpg" },
  { id: "SHUKRA",  name: "Shukra",  color: "#ec4899", radius: 2, tier: 2, cost: 11, description: "Triple time on next 2 captures",                          image: "/images/shukra.jpg"  },
  // Tier 3
  { id: "BUDHA",   name: "Budha",   color: "#3b82f6", radius: 1, tier: 3, cost: 10, description: "Two moves (not if first captures)",                       image: "/images/budha.jpg"   },
  { id: "MANGALA", name: "Mangala", color: "#ef4444", radius: 1, tier: 3, cost: 12, description: "Capture any adjacent piece",                              image: "/images/mangala.jpg" },
  { id: "SHANI",   name: "Shani",   color: "#1f2937", radius: 1, tier: 3, cost: 14, description: "Freeze enemy piece for 2 turns",                          image: "/images/shani.jpg"   },
];

export const CARD_EMOJI = {
  RAHU:    "🔮",
  KETU:    "☄️",
  SURYA:   "☀️",
  CHANDRA: "🌙",
  GURU:    "🪐",  
  SHUKRA:  "💫",
  BUDHA:   "⚡",
  MANGALA: "🔥",
  SHANI:   "❄️",
};

// Time reward for capturing each piece type
export const PIECE_VALUES = {
  p: 2,
  n: 4,
  b: 4,
  r: 6,
  q: 8,
};

// Returns a theme object based on the current game mode.
// Pass null/undefined for the pre-game default.
export function getTheme(gameMode) {
  switch (gameMode) {
    case "asura":
      return {
        background:  "#0a0a0a",
        darkSquare:  "#8b0000",
        lightSquare: "#3a0000",
        accent:      "#ff4444",
        text:        "#ff6b6b",
      };
    case "shukracharya":
      return {
        background:  "#0d0a1a",
        darkSquare:  "#4a3060",
        lightSquare: "#d4c5e8",
        accent:      "#e8d5a3",
        text:        "#e8d5a3",
      };
    default:
      return {
        background:  "#1a1a2e",
        darkSquare:  "#4a5568",
        lightSquare: "#cbd5e0",
        accent:      "#4ecca3",
        text:        "#eee",
      };
  }
}
