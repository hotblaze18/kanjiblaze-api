const mongoose = require("mongoose");
const extend = require("mongoose-extend-schema");

const cardSchema = require("./card.schema");

const radicalSchema = extend(cardSchema, {});

const Radical = mongoose.model("radical", radicalSchema);

module.exports = Radical;
