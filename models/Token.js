import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, red: "User" },
    refreshToken: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const TokenModel = model("Token", schema);
