console.log("gameConstants loaded");
export const SHARED_DECK = [
  // Tier 1
  { id: "RAHU", name: "Rahu", color: "#9333ea", radius: 3, tier: 1, cost: 7, description: "Pass through pieces for 2 moves", image: "/images/rahu.jpg" },
  { id: "KETU", name: "Ketu", color: "#f97316", radius: 3, tier: 1, cost: 8, description: "If captured, returns to activation square instead of dying", image: "/images/ketu.jpg" },
  { id: "SURYA", name: "Surya", color: "#fbbf24", radius: 2, tier: 1, cost: 8, description: "Can't be captured for 2 moves", image: "/images/surya.jpg" },
  // Tier 2
  { id: "CHANDRA", name: "Chandra", color: "#e5e7eb", radius: 2, tier: 2, cost: 10, description: "Place 1-2 clones on rank, and teleport across rank if desired", image: "/images/chandra.jpg" },
  { id: "GURU", name: "Guru", color: "#a855f7", radius: 2, tier: 2, cost: 9, description: "Spawn a real duplicate left or right — it moves and can capture for 2 turns before it dissolves", image: "/images/guru.jpg" },
  { id: "SHUKRA", name: "Shukra", color: "#ec4899", radius: 2, tier: 2, cost: 11, description: "Resurrect a captured piece where it died, only if the square is empty and you have another piece within 2 tiles", image: "/images/shukra.jpg" },
  // Tier 3
  { id: "BUDHA", name: "Budha", color: "#3b82f6", radius: 1, tier: 3, cost: 10, description: "One piece can move twice in one turn. But not if the first move is a capture.", image: "/images/budha.jpg" },
  { id: "MANGALA", name: "Mangala", color: "#ef4444", radius: 1, tier: 3, cost: 12, description: "Capture any adjacent piece", image: "/images/mangala.jpg" },
  { id: "SHANI", name: "Shani", color: "#1f2937", radius: 1, tier: 3, cost: 14, description: "Freeze enemy piece within one tile for 2 turns", image: "/images/shani.jpg" },
];


export const CARD_EMOJI = {
  RAHU: "🔮",
  KETU: "☄️",
  SURYA: "☀️",
  CHANDRA: "🌙",
  GURU: "🪐",
  SHUKRA: "💫",
  BUDHA: "⚡",
  MANGALA: "🔥",
  SHANI: "❄️",
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
const getTheme = function (gameMode) {
  switch (gameMode) {
    case "asura":
      return {
        background: "#0a0a0a",
        darkSquare: "#8b0000",
        lightSquare: "#3a0000",
        accent: "#ff4444",
        text: "#ff6b6b",
      };
    case "shukracharya":
      return {
        background: "#0d0a1a",
        darkSquare: "#4a3060",
        lightSquare: "#d4c5e8",
        accent: "#e8d5a3",
        text: "#e8d5a3",
      };
    case "pvp":
      return {
        background: "#1a1a2e",
        darkSquare: "#222222",
        lightSquare: "#c0c0c0",
        accent: "#4ecca3",
        text: "#eee",
      };
    default:
      return {
        background: "#1a1a2e",
        darkSquare: "#4a5568",
        lightSquare: "#cbd5e0",
        accent: "#4ecca3",
        text: "#eee",
      };
  }
};

export { getTheme };

// ── ASURA DECK (Black's cards in PvP mode) ────────────────────────────────────
export const ASURA_DECK = [
  // Tier 1
  { id: "RAVANA", name: "Ravana", color: "#8B0000", radius: 3, tier: 1, cost: 8, description: "Moves like a queen for 1 turn — ten heads see all directions", image: "/images/ravana.jpg" },
  { id: "HIRANYA", name: "Hiranya", color: "#B8860B", radius: 2, tier: 1, cost: 8, description: "Cannot be captured for 2 turns — Brahma's boon of invincibility", image: "/images/hiranyakasipu.jpg" },
  { id: "SHUKRA_ASURA", name: "Shukracharya", color: "#C2185B", radius: 1, tier: 1, cost: 11, description: "Transform this pawn into the first enemy piece it faces on its file", image: "/images/shukracharya.jpg" },  // Tier 2
  // Tier 2
  { id: "MAHISHA", name: "Mahishasura", color: "#2D5A1B", radius: 2, tier: 2, cost: 10, description: "Shapeshift into any piece type you have captured", image: "/images/mahishasura.jpg" },
  { id: "BALI", name: "Bali", color: "#6B3FA0", radius: 2, tier: 2, cost: 9, description: "Resurrect a captured piece where it died", image: "/images/bali.jpg" },
  { id: "SHUMBHA", name: "Shumbha-Nishumbha", color: "#7A3B00", radius: 1, tier: 2, cost: 12, description: "Capture an enemy piece then snap back to your origin square", image: "/images/shumbhanishumbha.jpg" },

  // Tier 3
  { id: "TARAKA", name: "Tarakasura", color: "#1A1A1A", radius: 1, tier: 3, cost: 11, description: "Can only be captured by a piece of the same type for 3 turns", image: "/images/tarakasura.jpg" },
  { id: "KALI_ASURA", name: "Kali", color: "#4A0E4E", radius: 1, tier: 3, cost: 8, description: "Capture any adjacent enemy piece, ignoring movement rules", image: "/images/kali.jpg" },
  { id: "VRITRA", name: "Vritra", color: "#0A2A4A", radius: 2, tier: 3, cost: 9, description: "Opponent's pieces cannot enter or cross this piece's rank for 2 turns", image: "/images/vritra.jpg" },
];

export const ASURA_CARD_EMOJI = {
  RAVANA: "👑",
  HIRANYA: "🛡️",
  KALI_ASURA: "⚔️",
  MAHISHA: "🐃",
  VRITRA: "🐍",
  BALI: "🙏",
  TARAKA: "💀",
  SHUMBHA: "👥",
  SHUKRA_ASURA: "💫",
};