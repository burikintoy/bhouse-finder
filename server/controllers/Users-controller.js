const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const UserModel = require("../models/User-Schema");
const HttpError = require("../models/Http-Error");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password");
  } catch (error) {
    const err = new HttpError("Fetching user failed, please try again", 500);
    return next(err);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again", 500);
    return next(err);
  }

  if (existingUser) {
    const err = new HttpError("User exists already", 422);
    return next(err);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError("Could not create user, please try again", 500);
    return next(err);
  }

  const createdUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError("Creating user failed, please try again", 500);
    return next(err);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Creating user failed, please try again", 500);
    return next(err);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Logging in failed, please try again", 500);
    return next(err);
  }

  if (!existingUser) {
    const err = new HttpError("Invalid credentials", 401);
    return next(err);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    const err = new HttpError(
      "Email or Password is wrong, please try again",
      500
    );
  }

  if (!isValidPassword) {
    const err = new HttpError("Invalid credentials", 401);
    return next(err);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Invalid credentials, please try again", 500);
    return next(err);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

module.exports = { getUsers, signup, login };
