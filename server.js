const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/keys");
const NumbersModel = require("./models/numbersModel");
const path = require("path");
var cors = require("cors");
const app = express();

/******************************************MiddleWares  ********************************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/******************************************MongoDb Connection********************************************/

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.log(err));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("./client/build"));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

app.get("/generate", async (req, res) => {
  const getArray = await NumbersModel.findOne();
  if (getArray) {
    res.send(getArray);
  } else {
    const newArray = new NumbersModel({
      numbersArray: Array(100)
        .fill(1)
        .map((n, i) => n + i),
    });

    let saveIt = await newArray.save();
    if (saveIt) {
      res.send(saveIt);
    } else {
      res.send({ errorMessage: "Array could not be created" });
    }
  }
});

app.get("/filter-number/:num", async (req, res) => {
  const getArray = await NumbersModel.findOne();
  console.log(req.params.num);
  if (getArray && req.params.num) {
    let filterIt = await getArray?.numbersArray?.filter(
      (f) => f !== parseInt(req.params.num)
    );
    getArray.numbersArray = filterIt;
    let saveIt = await getArray.save();
    if (saveIt) {
      res.send(saveIt);
    } else {
      res.send({ successMessage: "Number could not be filtered" });
    }
  } else {
    console.log("Array not found");
  }
});

app.listen(process.env.PORT || 8000, () =>
  console.log("Listening to port 8000")
);
