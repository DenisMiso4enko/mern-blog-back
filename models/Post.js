import { Schema, model, } from "mongoose";

const schema = new Schema(
	{
		userId: {type: Schema.Types.ObjectId},
		userName: String,
		title: { type: String, require: true },
		description: String,
		text: String,
		image: String,
		likes: [{type: Schema.Types.ObjectId, ref: "User"}],
		dislikes: [{type: String, ref: "User"}],
		views: {type: Number, default: 0},
	},
	{
		timestamps: true,
	}
);

export const PostModel = model("Post", schema);
