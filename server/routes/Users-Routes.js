const express = require("express");

const { check } = require("express-validator");
const { getUsers, signup, login } = require("../controllers/Users-controller");

const FileUpload = require("../middleware/file-upload");
const HttpError = require("../models/Http-Error");

const router = express.Router();

// router.get("/", (req, res, next) => {
//   console.log("GET REQUEST in Places");
//   res.json({ message: "It works!" });
// });

router.get("/", getUsers);
router.post(
  "/signup",
  FileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);
router.post("/login", login);

module.exports = router;
