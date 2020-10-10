const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  cardNo: {
    type: Number,
    required: true,
    unique: true,
  },
  cardBody: {
    type: String,
  },
  cardImg: {
    type: String,
  },
  cardMeaning: {
    type: [String],
    required: true,
  },
  cardLevel: {
    type: String,
    min: 1,
    max: 60,
    required: true,
  },
  type: {
    type: String,
    required: true,
    lowercase: true,
    enum: {
      values: ["radical", "kanji", "vocabulary"],
      message: ["The card can not be of the type specified."],
    },
  },
  meaningMnemonic: {
    type: String,
    required: true,
  },
});

module.exports = cardSchema;

/*
difficulty: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  daysBetweenReviews: {
    type: mongoose.Types.Decimal128,
  },
  dateLastReviewed: {
    type: Date,
  },
*/
