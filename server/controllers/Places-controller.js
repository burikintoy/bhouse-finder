const fs = require("fs");
const mongoose = require("mongoose");
const HttpError = require("../models/Http-Error");
const PlaceModel = require("../models/Place-Schema");
const UserModel = require("../models/User-Schema");
const { validationResult } = require("express-validator");
const getCoordinatesForAddress = require("../util/Location");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pId;

  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not find a place ",
      500
    );
    return next(err);
  }

  if (!place) {
    const err = new HttpError(
      "Could not find a place for the provided id!",
      404
    );
    return next(err);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uId;

  let places;
  try {
    places = await PlaceModel.find({ creator: userId });
  } catch (error) {
    const err = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(err);
  }

  if (!places || places.length === 0) {
    const err = new HttpError(
      "Could not find a place for the provided user id!",
      404
    );
    return next(err);
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description, address } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new PlaceModel({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;

  try {
    user = await UserModel.findById(req.userData.userId);
  } catch (error) {
    const err = new HttpError("Creating place failed, please try again", 500);
    return next(err);
  }

  if (!user) {
    const err = new HttpError("Could not find user for provided id", 404);
    return next(err);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    // const err = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceByID = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pId;

  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (error) {
    const err = new HttpError("Updating place failed, please try again", 500);
    return next(err);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const err = new HttpError("You are not allowed to edit this place", 401);
    return next(err);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new HttpError("Saving place failed, please try again", 500);
    return next(err);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceByID = async (req, res, next) => {
  const placeId = req.params.pId;

  let place;

  try {
    place = await PlaceModel.findByIdAndRemove(placeId).populate("creator");
  } catch (error) {
    const err = new HttpError("Deleting place failed, please try again", 500);
    return next(err);
  }

  if (!place) {
    const err = new HttpError("Could not find place for this id", 404);
    return next(err);
  }

  if (place.creator.id !== req.userData.userId) {
    const err = new HttpError("You are not allowed to delete this place", 401);
    return next(err);
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError("Deleting place failed, please try again", 500);
    return next(err);
  }
  fs.unlink(imagePath, () => {});

  res.status(200).json({ message: "Deleted place." });
};

module.exports = {
  getPlacesByUserId,
  getPlaceById,
  createPlace,
  updatePlaceByID,
  deletePlaceByID,
};
