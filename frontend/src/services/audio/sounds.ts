export type SoundCategory = "ui" | "gameplay" | "system" | "music" | "ambient";

export interface SoundDefinition {
  src: string[];
  volume: number;
  category: SoundCategory;
  cooldown?: number; // in milliseconds
}

export const SOUND_LIBRARY = {
  click: {
    src: ["/sounds/click.mp3"],
    volume: 0.15,
    category: "ui",
    cooldown: 20,
  },
  move: {
    src: ["/sounds/move.mp3"],
    volume: 0.35,
    category: "gameplay",
    cooldown: 100,
  },
  opponentMove: {
    src: ["/sounds/opponentMove.mp3"],
    volume: 0.35,
    category: "gameplay",
    cooldown: 100,
  },
  invalid: {
    src: ["/sounds/invalid.mp3"],
    volume: 0.25,
    category: "gameplay",
    cooldown: 150,
  },
  reclaim: {
    src: ["/sounds/reclaim.mp3"],
    volume: 0.45,
    category: "gameplay",
    cooldown: 150,
  },
  disappear: {
    src: ["/sounds/disappear.mp3"],
    volume: 0.40,
    category: "gameplay",
    cooldown: 150,
  },
  victory: {
    src: ["/sounds/victory.mp3"],
    volume: 0.80,
    category: "gameplay",
    cooldown: 2000,
  },
  defeat: {
    src: ["/sounds/defeat.mp3"],
    volume: 0.65,
    category: "gameplay",
    cooldown: 2000,
  },
  draw: {
    src: ["/sounds/draw.mp3"],
    volume: 0.50,
    category: "gameplay",
    cooldown: 2000,
  },
  gameStart: {
    src: ["/sounds/gameStart.mp3"],
    volume: 0.50,
    category: "gameplay",
    cooldown: 500,
  },
  gameEnd: {
    src: ["/sounds/gameEnd.mp3"],
    volume: 0.50,
    category: "gameplay",
    cooldown: 500,
  },
  playerJoin: {
    src: ["/sounds/playerJoin.mp3"],
    volume: 0.40,
    category: "system",
    cooldown: 300,
  },
  playerLeave: {
    src: ["/sounds/playerLeave.mp3"],
    volume: 0.40,
    category: "system",
    cooldown: 300,
  },
  reconnect: {
    src: ["/sounds/reconnect.mp3"],
    volume: 0.40,
    category: "system",
    cooldown: 300,
  },
  notification: {
    src: ["/sounds/notification.mp3"],
    volume: 0.30,
    category: "ui",
    cooldown: 500,
  },
} as const satisfies Record<string, SoundDefinition>;

export type SoundKey = keyof typeof SOUND_LIBRARY;
