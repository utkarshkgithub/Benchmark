// models/Token.js
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  jwt: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: "1h" }, // auto-delete after 1 hour
  }
});

const Token = mongoose.model("Token", tokenSchema);
export default Token;
