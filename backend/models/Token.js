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
    index: { expires: "2m" }, // auto-delete after 2 minutes
  }
  ,
  // Optional location where the QR was generated (instructor/device)
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
});

const Token = mongoose.model("Token", tokenSchema);
export default Token;
