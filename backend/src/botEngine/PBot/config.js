const config = {
  DEFAULT_DEPTH: 8,

  INITIAL_ALPHA: Number.NEGATIVE_INFINITY,
  INITIAL_BETA: Number.POSITIVE_INFINITY,

  DRAW_SCORE: 0,

  // Small adjustment used by the search to prefer faster wins and slower losses
  // without taking ownership of the actual position evaluation from judge.js.
  DEPTH_SCORE_FACTOR: 1,

  MOVE_PRIORITY: {
    IMMEDIATE_WIN: 600,
    IMMEDIATE_BLOCK: 500,
    RECLAIM: 300,
    CENTER: 200,
    CORNER: 100,
    DEFAULT: 0,
  },
};

module.exports = config;
