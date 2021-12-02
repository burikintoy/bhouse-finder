const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const PlaceSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

PlaceSchema.plugin(uniqueValidator);

const placeSchema = mongoose.model("Place", PlaceSchema);
module.exports = placeSchema;
