import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    favorites: [{type: Schema.Types.ObjectId, ref: "Post"}],
  },
  {
    timestamps: true,
  }
);

export const UserModel = model("User", schema);
