const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      //token: token,
    })

    const isTokenValid = (token === user.token.find((tok) => tok === token));
    

    if (!user || !isTokenValid) {
      throw new Error("Please authenticate");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ status: "fail", message: "Please authenticate." });
  }
};

module.exports = auth;
