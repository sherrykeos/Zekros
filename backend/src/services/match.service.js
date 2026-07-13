import prisma from "../lib/prisma.js";
import * as matchRepository from "../repositories/match.repository.js";
import * as moveRepository from "../repositories/move.repository.js";
import * as participantRepository from "../repositories/participant.repository.js";

const MATCH_STATUS_TO_DB = Object.freeze({
  WAITING: "WAITING",
  PLAYING: "IN_PROGRESS",
  FINISHED: "COMPLETED",
});

const GAME_MODE_TO_DB = Object.freeze({
  HUMAN_VS_NBOT: "NBOT",
  HUMAN_VS_PBOT: "PBOT",
  LOCAL: "LOCAL",
  ONLINE: "ONLINE",
  NBOT: "NBOT",
  PBOT: "PBOT",
});

const GAME_TYPE_TO_DB = new Set(["CLASSIC", "CUSTOM", "RANKED", "CASUAL"]);
const PLAYER_SYMBOL_TO_RESULT = Object.freeze({ X: "PLAYER_X", O: "PLAYER_O" });
const RESULT_TO_PLAYER_SYMBOL = Object.freeze({ PLAYER_X: "X", PLAYER_O: "O" });

export async function persistMatch(match) {
  return prisma.$transaction(async (tx) => {
    const persistedMatch = await matchRepository.create(toMatchCreateData(match), tx);

    const participants = getRuntimeParticipants(match).map((participant) =>
      toParticipantCreateData(match.id, participant),
    );

    for (const participant of participants) {
      await participantRepository.create(participant, tx);
    }

    return persistedMatch;
  });
}

export async function persistMove(match, move) {
  return prisma.$transaction(async (tx) => {
    const participant = await participantRepository.findByMatchAndSymbol(match.id, move.player, tx);

    if (!participant) {
      throw new Error(`Cannot persist move ${move.id}: participant ${move.player} was not persisted.`);
    }

    const persistedMove = await moveRepository.create(toMoveCreateData(match.id, participant.id, move), tx);

    await matchRepository.update(
      match.id,
      {
        totalMoves: {
          increment: 1,
        },
      },
      tx,
    );

    if (match.status === "FINISHED") {
      await completeMatchInTransaction(match, tx);
    }

    return persistedMove;
  });
}

export async function completeMatch(match) {
  return prisma.$transaction((tx) => completeMatchInTransaction(match, tx));
}

export function getHistory(matchId) {
  return matchRepository.findWithParticipantsAndMoves(matchId);
}

export async function getReplay(matchId) {
  const match = await matchRepository.findById(matchId);

  if (!match) {
    return null;
  }

  return moveRepository.findByMatch(matchId);
}

async function completeMatchInTransaction(match, tx) {
  const persistedMatch = await matchRepository.update(match.id, toMatchCompletionData(match), tx);
  const participants = await participantRepository.findByMatch(match.id, tx);

  for (const participant of participants) {
    await participantRepository.update(
      participant.id,
      {
        isWinner: participant.symbol === toWinnerSymbol(match.winner),
      },
      tx,
    );
  }

  return persistedMatch;
}
function toMatchCreateData(match) {
  const config = match.game.config;
  const metadata = match.metadata ?? {};

  return {
    id: match.id,
    status: MATCH_STATUS_TO_DB[match.status] ?? "IN_PROGRESS",
    result: toMatchResult(match.winner),
    gameMode: toGameMode(metadata.gameMode ?? config.gameMode, metadata),
    gameType: toGameType(metadata.gameType ?? config.gameType, metadata),
    boardSize: Number(config.boardSize),
    winLength: Number(config.winLength),
    maxActivePieces: Number(config.maxActivePieces),
    reclaimTokens: Number(config.reclaimTokens),
    startedAt: toDate(match.startedAt),
    endedAt: toNullableDate(match.endedAt),
    durationMs: calculateDurationMs(match),
    totalMoves: match.moveHistory.length,
    isRated: Boolean(metadata.isRated),
    isPrivate: Boolean(metadata.isPrivate),
  };
}

function toMatchCompletionData(match) {
  return {
    status: "COMPLETED",
    result: toMatchResult(match.winner),
    endedAt: toNullableDate(match.endedAt) ?? new Date(),
    durationMs: calculateDurationMs(match),
    totalMoves: match.moveHistory.length,
  };
}

function toParticipantCreateData(matchId, participant) {
  return {
    matchId,
    userId: participant.userId ?? null,
    guestName: participant.userId ? null : participant.name ?? "Guest",
    symbol: normalizeSymbol(participant.symbol),
    joinedAt: toDate(participant.joinedAt),
  };
}

function toMoveCreateData(matchId, participantId, move) {
  const removedCell = getRemovedCell(move);

  return {
    id: move.id,
    matchId,
    playerId: participantId,
    moveNumber: move.turn,
    row: Number(move.move.row),
    column: Number(move.move.col),
    removedRow: removedCell?.row ?? null,
    removedColumn: removedCell?.col ?? null,
    createdAt: toDate(move.timestamp),
  };
}

function getRuntimeParticipants(match) {
  const participants = match.metadata?.participants ?? [];

  if (participants.length > 0) {
    return participants;
  }

  return [
    { name: "Player X", symbol: "X" },
    { name: "Player O", symbol: "O" },
  ];
}

function toGameMode(mode, metadata = {}) {
  const normalizedMode = String(mode ?? "").trim().toUpperCase();

  if (normalizedMode === "HUMAN_VS_HUMAN") {
    return metadata.roomCode ? "ONLINE" : "LOCAL";
  }

  if (GAME_MODE_TO_DB[normalizedMode]) {
    return GAME_MODE_TO_DB[normalizedMode];
  }

  return metadata.roomCode ? "ONLINE" : "LOCAL";
}

function toGameType(gameType, metadata = {}) {
  const normalizedType = String(gameType ?? "").trim().toUpperCase();

  if (GAME_TYPE_TO_DB.has(normalizedType)) {
    return normalizedType;
  }

  return metadata.isRated ? "RANKED" : "CASUAL";
}

function toMatchResult(winner) {
  return PLAYER_SYMBOL_TO_RESULT[toWinnerSymbol(winner)] ?? null;
}

function toWinnerSymbol(winner) {
  const normalizedWinner = String(winner ?? "").trim().toUpperCase();
  return RESULT_TO_PLAYER_SYMBOL[normalizedWinner] ?? normalizedWinner;
}

function normalizeSymbol(symbol) {
  const normalized = String(symbol ?? "").trim().toUpperCase();

  if (normalized !== "X" && normalized !== "O") {
    throw new Error(`Invalid participant symbol for persistence: ${symbol}`);
  }

  return normalized;
}

function getRemovedCell(move) {
  if (move.metadata?.isReclaimMove) {
    return null;
  }

  return parseCellId(move.metadata?.expiringCellId);
}

function parseCellId(cellId) {
  if (!cellId) {
    return null;
  }

  const [row, col] = String(cellId).split("-").map(Number);

  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    return null;
  }

  return { row, col };
}

function calculateDurationMs(match) {
  const startedAt = toDate(match.startedAt);
  const endedAt = toNullableDate(match.endedAt);

  if (!startedAt || !endedAt) {
    return null;
  }

  return Math.max(0, endedAt.getTime() - startedAt.getTime());
}

function toNullableDate(value) {
  return value ? toDate(value) : null;
}

function toDate(value) {
  if (value instanceof Date) {
    return value;
  }

  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}