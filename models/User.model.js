const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    age: {
      type: Number,
    },
    grade: {
      type: String,
    },
    gender: {
      type: String,
      default: "Not Specified",
    },
    major: {
      type: String,
      default: "Not Specified",
    },
    eduInst: {
      type: String,
      default: "Not Specified",
    },
    password: {
      type: String,
    },
    ip_encrypted: {
      type: String,
    },
    location: {
      type: String,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    sessionToken: {
      type: String,
    },
    updates: {
      type: Array,
      default: [],
    },
  },
  { collection: "users" }
);

const User = mongoose.model("user", UserSchema);
module.exports = User;
