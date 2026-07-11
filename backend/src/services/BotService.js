import Player from "../entities/Player.js";
import NBot from "../botEngine/NBot.js";
import PBot from "../botEngine/PBot/index.js";

const GAME_MODES = Object.freeze({
  HUMAN_VS_HUMAN: "HUMAN_VS_HUMAN",
  HUMAN_VS_NBOT: "HUMAN_VS_NBOT",
  HUMAN_VS_PBOT: "HUMAN_VS_PBOT",
});

const BOT_SYMBOL = "O";

class BotService {
  constructor() {
    this.strategies = {
      [GAME_MODES.HUMAN_VS_NBOT]: new NBot(),
      [GAME_MODES.HUMAN_VS_PBOT]: new PBot(),
    };
  }

  normalizeMode(value) {
    const mode = String(value ?? GAME_MODES.HUMAN_VS_HUMAN).trim().toUpperCase();

    if (["HUMAN", "HVH", "HUMAN_VS_HUMAN", "MULTIPLAYER"].includes(mode)) {
      return GAME_MODES.HUMAN_VS_HUMAN;
    }

    if (["NBOT", "NORMAL", "NORMAL_BOT", "HUMAN_VS_NBOT"].includes(mode)) {
      return GAME_MODES.HUMAN_VS_NBOT;
    }

    if (["PBOT", "PRO", "PRO_BOT", "HUMAN_VS_PBOT"].includes(mode)) {
      return GAME_MODES.HUMAN_VS_PBOT;
    }

    return null;
  }

  resolveMode({ room = null, config = {}, metadata = {} } = {}) {
    return this.normalizeMode(
      config.gameMode ??
        config.mode ??
        metadata.gameMode ??
        metadata.mode ??
        room?.settings?.gameMode ??
        room?.settings?.mode ??
        room?.metadata?.gameMode ??
        room?.metadata?.mode,
    );
  }

  isBotMode(mode) {
    return mode === GAME_MODES.HUMAN_VS_NBOT || mode === GAME_MODES.HUMAN_VS_PBOT;
  }

  createBotPlayer(mode) {
    const normalizedMode = this.normalizeMode(mode);
    const name = normalizedMode === GAME_MODES.HUMAN_VS_PBOT ? "PBot" : "NBot";

    return new Player({
      id: `bot_${normalizedMode.toLowerCase()}`,
      name,
      symbol: BOT_SYMBOL,
      type: Player.TYPE.BOT,
      metadata: {
        difficulty: normalizedMode === GAME_MODES.HUMAN_VS_PBOT ? "PRO" : "NORMAL",
        gameMode: normalizedMode,
      },
    });
  }

  isBotPlayer(player) {
    return player?.type === Player.TYPE.BOT;
  }

  getBotParticipant(participants = []) {
    return participants.find((participant) => this.isBotPlayer(participant)) ?? null;
  }

  getBotForMode(mode) {
    return this.strategies[this.normalizeMode(mode)] ?? null;
  }

  chooseMove({ game, mode, symbol }) {
    const bot = this.getBotForMode(mode);

    if (!bot || !game || game.isGameOver()) {
      return null;
    }

    return bot.getMove(game, symbol);
  }
}

const botService = new BotService();
botService.GAME_MODES = GAME_MODES;
botService.BOT_SYMBOL = BOT_SYMBOL;

export default botService;
