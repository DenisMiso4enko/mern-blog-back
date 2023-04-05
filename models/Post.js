import { Schema, model } from "mongoose";

const schema = new Schema(
	{
		userId: String,
		userName: String,
		title: { type: String, require: true },
		description: String,
		text: String,
		image: String,
		likes: {type: Number, default: 0},
		dislikes: {type: Number, default: 0},
		views: {type: Number, default: 0},


	},
	{
		timestamps: true,
	}
);

export const PostModel = model("Post", schema);
