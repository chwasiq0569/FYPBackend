const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    name: { type: String, required: true, min: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 3 },
  },
  { collection: "user-data" }
);

const model = mongoose.model("UserData", User);

module.exports = model;
