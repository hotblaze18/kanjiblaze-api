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

const whitelist = ['http://localhost:3001', 'http://kanjiblaze.herokuapp.com'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
}

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// app.use(
//   cors(corsOptions)
// );

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions), userRouter);

// const moment = require("moment");
// console.log(moment());

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`app running on port ${port}`));
