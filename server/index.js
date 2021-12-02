const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");


const PlacesRoutes = require("./routes/Places-Routes");
const UserRoutes = require("./routes/Users-Routes");
const HttpError = require("./models/Http-Error");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/api/places", PlacesRoutes);
app.use("/api/users", UserRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err, file) => {});
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});


const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;

const CONNECTION_URL = `mongodb+srv://${db_username}:${db_password}@cluster0.oytaf.mongodb.net/${db_name}?retryWrites=true&w=majority`;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => console.log(err));
