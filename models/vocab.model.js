const mongoose = require("mongoose");
const extend = require("mongoose-extend-schema");

const cardSchema = require("./card.schema");

const vocabSchema = extend(cardSchema, {
  kanaReading: {
    type: String,
    required: true,
  },
  readingMnemonic: {
    type: String,
    required: true,
  },
  partOfSpeech: {
    type: String,
    required: true,
  },
  contextSentences: {
    type: [
      {
        sentence: String,
        meaning: String,
      },
    ],
    required: true,
  },
});

const Vocab = mongoose.model("vocabulary", vocabSchema);

module.exports = Vocab;
