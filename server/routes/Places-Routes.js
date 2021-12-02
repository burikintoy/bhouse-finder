const express = require("express");
const { check } = require("express-validator");
const auth = require("../middleware/auth");

const {
  getPlacesByUserId,
  getPlaceById,
  createPlace,
  deletePlaceByID,
  updatePlaceByID,
} = require("../controllers/Places-controller");

const FileUpload = require("../middleware/file-upload");
const HttpError = require("../models/Http-Error");

const router = express.Router();

// router.get("/", (req, res, next) => {
//   console.log("GET REQUEST in Places");
//   res.json({ message: "It works!" });
// });

router.get("/:pId", getPlaceById);
router.get("/user/:uId", getPlacesByUserId);
router.use(auth);
router.post(
  "/create-place",
  FileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);
router.patch(
  "/update/:pId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  updatePlaceByID
);
router.delete("/delete/:pId", deletePlaceByID);

module.exports = router;
