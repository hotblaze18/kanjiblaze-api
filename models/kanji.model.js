const mongoose = require("mongoose");
const extend = require("mongoose-extend-schema");

const cardSchema = require("./card.schema");

const kanjiSchema = extend(cardSchema, {
  mainReading: {
    type: String,
    required: true,
  },
  Onyomi: {
    type: [String],
    required: true,
  },
  Kunyomi: {
    type: [String],
    required: true,
  },
  additionalM: {
    type: String,
  },
  readingMnemonic: {
    type: String,
    required: true,
  },
  additionalR: {
    type: String,
  },
});

const Kanji = mongoose.model("kanji", kanjiSchema);

module.exports = Kanji;
