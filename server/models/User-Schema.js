const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  image: {
    type: String,
    required: true,
  },
  places: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Place",
    },
  ],
});

UserSchema.plugin(uniqueValidator);

const userSchema = mongoose.model("User", UserSchema);

module.exports = userSchema;
