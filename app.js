const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const userRouter = require("./routers/user.router");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected...");
  })
  .catch((e) => {
    throw Error(e);
  });

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  cors({
    origin: "http://localhost:3001",
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(userRouter);

// const fs = require("fs");
// const vocabs = require("./static/vocabs.json");
// const vocreadings = vocabs.map((vocab) => vocab.kanaReading);
// fs.writeFileSync("./static/vocreadings.json", JSON.stringify(vocreadings));
// const cno = {};

// cards.forEach((card) => {
//   cno[card.cardNo] = card;
// });

// fs.writeFileSync("./static/cno.json", JSON.stringify(cno));

// const moment = require("moment");
// console.log(moment());

const port = process.env.PORT || 3000;
app.listen(process.env.PORT, () => console.log(`app running on port ${port}`));
