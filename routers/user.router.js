const express = require("express");
const mongoose = require("mongoose");

const Radical = require("../models/radical.model");
const Kanji = require("../models/kanji.model");
const Vocab = require("../models/vocab.model");
const User = require("../models/user.model");
const Card = require("../models/card.model");
const auth = require("../middleware/auth");

const moment = require("moment");

const Router = express.Router();

const uicards = require("../static/cards.json");

// helper method to set initial user data
const setUserData = (req, cards) => {
  const userData = req.body;
  const levelsInfo = {};

  const userCards = [];
  const belongsTo = mongoose.Types.ObjectId();
  cards.map((card) => {
    const { type, cardNo, cardLevel } = card;
    const cardToBepushed = {
      belongsTo,
      type,
      cardNo,
      cardLevel,
    };
    userCards.push(cardToBepushed);
  });
  levelsInfo[1] = { startedAt: Date.now() };
  for (let i = 2; i <= 60; i++) {
    levelsInfo[i] = {};
  }
  userData._id = belongsTo;
  userData.levelsInfo = levelsInfo;
  const user = new User(userData);
  return { user, userCards };
};

// Helper method to set the cookie in response header
const setJwtCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'None',
  };
  if (process.env.NODE_ENV === "production") 
    cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
};

//Create new user and also initialize all user data
Router.post("/user/create", async (req, res) => {
  try {
    const { user, userCards } = setUserData(req, uicards);
    await user.save(); 
    await Card.insertMany(userCards);
    const token = await user.generateAuthToken();
    setJwtCookie(res, token);
    res.status(201).send({ status: "success", data: { user }, token });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      status: "failed",
      message:
        "There was a problem in creating the user. Please try again later.",
    });
  }
});

//login the user return jwt on success
Router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    setJwtCookie(res, token);
    res.status(200).send({
      status: "success",
      data: { user },
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ status: "fail", message: "Incorrect Credentials" });
  }
});

//get user info
Router.get("/user/me", auth, (req, res) => {
  const user = req.user;
  res.status(200).send({
    status: "success",
    data: { user },
  });
});

//update user level
Router.patch("/user/level", auth, async (req, res) => {
  const user = req.user;
  const { newLevel } = req.body;
  try {
    user.currLevel = newLevel;
    await user.save();
    res.status(200).send({
      status: "success",
      message: "Successfully updated/",
    });
  } catch (e) {
    res.status(400).send({
      status: "fail",
      messsage: "There was some problem.Try again Later.",
    });
  }
});

//get the userCards
Router.get("/user/cards", auth, async (req, res) => {
  const user = req.user;
  try {
    // await user.unlockCards();
    const userPop = await user
      .populate({
        path: "cards",
        options: { lean: true },
      })
      .execPopulate();
    res.status(200).send({
      status: "success",
      data: { cards: userPop.cards },
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      status: "fail",
      message: "Please try again later.",
    });
  }
});

//Unlock the cards given level and type
Router.post("/cards/unlock", auth, async (req, res) => {
  const user = req.user;
  const { type, level } = req.body;
  console.log(type, level, user._id);
  try {
    await Card.unlock(type, user._id, level);
    res.status(200).send({
      status: "success",
      message: "Sucessfully unlocked.",
    });
  } catch (e) {
    res.status(400).send({
      status: "fail",
      message: "There was some problem. Please try again later",
    });
  }

  // try {
  //   await user.unlockCards();
  //   res.status(200).send({
  //     status: "success",
  //   });
  // } catch (e) {
  //   res.status(400).send({
  //     status: "fail",
  //     message: "There was some problem. Please try again later",
  //   });
  // }
});

//update multiple user cards
Router.put("/user/cards", auth, async (req, res) => {
  const belongsTo = req.user._id;
  const cards = req.body.cards;
  try {
    const replaceQueries = Object.entries(cards).map(([cardNo, card]) => {
      return {
        replaceOne: {
          filter: {
            belongsTo,
            _id: card._id,
            cardNo,
            type: card.type,
          },
          replacement: card,
        },
      };
    });
    await Card.bulkWrite(replaceQueries);
    res.status(200).send({
      status: "success",
      message: "Successfully updated the documents.",
    });
  } catch (e) {
    res.status(400).send({
      status: "fail",
      message: "Updates did not happen correctly",
    });
    console.log(e);
  }
});

//get current level info
Router.get("/user/levelsinfo", auth, (req, res) => {
  const user = req.user;
  res.status(200).send({
    status: "success",
    data: { levelsInfo: user.levelsInfo },
  });
});

//update levels info
Router.patch("/user/levelsinfo", auth, async (req, res) => {
  const user = req.user;
  const levelsInfo = req.body.levelsInfo;
  //console.log(req.body);
  try {
    user.levelsInfo = levelsInfo;
    await user.save();
    res.status(200).send({
      status: "success",
      message: "Succesfully updated.",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      status: "fail",
      message: "There was some problem in updating.",
    });
  }
});


//sign out user
Router.get("/user/signout", auth, async (req, res) => {
  const user = req.user;
  user.token = "";
  
  try {
    await user.save();
    res.status(200).send({
      status: "success",
      message: "successfully signed out user"
    });
  } catch(e) {
    res.status(400).send({
      status: "fail",
      message: "Unable to complete request.Please try again later",
    })
  }
})



Router.post("/uicards", auth, async (req, res) => {
  const radIds = req.body.radIds;
  const kanIds = req.body.kanIds;
  const vocIds = req.body.vocIds;

  let rads = [],
    kan = [],
    voc = [];

  try {
    if (radIds.length !== 0) {
      radIds.map((id) => mongoose.Types.ObjectId(id));
      rads = await Radical.find({
        _id: {
          $in: radIds,
        },
      }).lean();
    }
    if (kanIds.length !== 0) {
      kanIds.map((id) => mongoose.Types.ObjectId(id));
      kan = await Kanji.find({
        _id: {
          $in: kanIds,
        },
      }).lean();
    }
    if (vocIds.length !== 0) {
      vocIds.map((id) => mongoose.Types.ObjectId(id));
      voc = await Vocab.find({
        _id: {
          $in: kanIds,
        },
      }).lean();
    }
    res.status(200).send({
      status: "success",
      data: {
        uicards: [...rads, ...kan, ...voc],
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      status: "fail",
      message: "Something went wrong.",
    });
  }
});

Router.get("/reviews/fast", auth, async (req, res) => {
  const belongsTo = req.user._id;
  const { type, cardLevel } = req.body;
  const now = moment(new Date());
  console.log(now);
  try {
    await Card.updateMany(
      { belongsTo, type, cardLevel },
      {
        $set: { learned: true, cardProgress: 5 }, //timeNextReview: now
      }
    );
    res.send("done");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = Router;
