const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  cardNo: {
    type: Number,
    required: true,
  },
  cardBody: {
    type: String,
  },
  cardMeaning: {
    type: [String],
    required: true,
  },
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  cardLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
  },
  mainReadings: {
    type: [String],
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
  learned: {
    type: Boolean,
    default: false,
  },
  timesCorrect: {
    type: Number,
    default: 0,
  },
  timesIncorrect: {
    type: Number,
    default: 0,
  },
  cardProgress: {
    type: Number,
    min: 1, // 1-> Appr1(4hrs) 2-> Appr2(8hrs) 3->Appr(1day) 4-> Appr4(2days)
    max: 9, //  5-> Guru1(1week) 6->Guru2(2weeks)
    default: 1, // 7-> Master(1month)  8-> Enlightened(4months)
    // 9-> Burned(remove from queue)
  },
  attainedLevel: {
    type: String,
    lowercase: true,
    default: "apprentince",
    enum: {
      values: ["apprentince", "guru", "master", "enlightened", "burned"],
      message: ["The card can not be of the type specified."],
    },
  },
  timeNextReview: {
    type: Date,
  },
});

CardSchema.index({ belongsTo: 1, cardNo: 1, cardLevel: 1, type: 1 });

CardSchema.statics.unlock = async (type, userId, cardLevel) => {
  try {
    await Card.updateMany(
      { belongsTo: userId, type, cardLevel },
      {
        $set: { unlocked: true },
      }
    );
  } catch (e) {
    console.log(e);
    throw new Error(
      "There was some problem at the server. Please try again later."
    );
  }
};

const Card = mongoose.model("Card", CardSchema);

module.exports = Card;
