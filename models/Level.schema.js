const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  radicalProgress: {
    type: Number,
    default: 0,
    min: 0,
  },
  kanjiProgress: {
    type: Number,
    default: 0,
    min: 0,
  },
  vocabProgress: {
    type: Number,
    default: 0,
    min: 0,
  },
  radicalsUnlocked: {
    type: Boolean,
    default: false,
  },
  kanjiUnlocked: {
    type: Boolean,
    default: false,
  },
  vocabUnlocked: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
  },
});

module.exports = LevelSchema;
