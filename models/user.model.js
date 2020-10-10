const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const LevelSchema = require("./Level.schema");

const Card = require("./card.model");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is Invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  currLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 60,
  },
  levelsInfo: {
    type: Map,
    of: LevelSchema,
  },
  token: {
    type: String,
  },
});

userSchema.virtual("cards", {
  ref: "Card",
  localField: "_id",
  foreignField: "belongsTo",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.token;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.token = token;
  await user.save();

  return token;
};

userSchema.methods.unlockCards = async function () {
  const user = this;
  const levelsInfo = Object.fromEntries(user.levelsInfo);
  const currLevelInfo = levelsInfo[user.currLevel];
  try {
    if (!currLevelInfo.radicalsUnlocked) {
      await Card.unlock("radical", user._id, user.currLevel);
      levelsInfo[user.currLevel].radicalsUnlocked = true;
      await User.updateOne({ _id: user._id }, { $set: { levelsInfo } });
    } else if (
      !currLevelInfo.kanjiUnlocked &&
      currLevelInfo.radicalProgress >= 90
    ) {
      await Card.unlock("kanji", user._id, user.currLevel);
      levelsInfo[user.currLevel].kanjiUnlocked = true;
      await User.updateOne({ _id: user._id }, { $set: { levelsInfo } });
    } else if (
      !currLevelInfo.vocabUnlocked &&
      currLevelInfo.kanjiProgress >= 90
    ) {
      await Card.unlock("vocabulary", user._id, user.currLevel);
      levelsInfo[user.currLevel].vocabUnlocked = true;
      await User.updateOne(
        { _id: user._id },
        { $set: { levelsInfo, currLevel: user.currLevel + 1 } }
      );
    }
  } catch (e) {
    throw new Error(e);
  }
};

// userSchema.methods.unlockCards = async function (type, cardLevel) {
//   const user = this;
//   try {
//     await Card.unlock(type, user._id, cardLevel);
//   } catch (e) {
//     throw new Error(e);
//   }
// };

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
