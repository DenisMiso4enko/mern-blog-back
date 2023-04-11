import chalk from "chalk";
import {Router} from "express";
import {PostModel} from "../models/Post.js";
import {paginateResults} from "../utils/Paginate.js";

export const postRouter = Router({mergeParams: true});

postRouter.get("/", async (req, res) => {
	try {
		const {page, limit} = req.query;

		const posts = await PostModel.find().sort({createdAt: -1});
		const results = paginateResults(page, limit, posts);

		if (posts) {
			res.status(200).json(results);
		}
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
});

postRouter.get("/getOne/:id", async (req, res) => {
	try {
		const {id} = req.params;
		const post = await PostModel.findByIdAndUpdate(id, {$inc: {views: 1}})
		if (post) {
			res.status(200).json(post);
		}
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: "не удалось найти пост"});
	}
});

postRouter.post("/create", async (req, res) => {
	try {
		const doc = new PostModel({
			...req.body,
		});
		const newProduct = await doc.save();

		res.status(201).json(newProduct);
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
});

postRouter.put("/like",  async (req, res) => {
	try {
		const {postId, userId} = req.body
		const result = await PostModel.findByIdAndUpdate(postId, {$push: {likes: userId}}, {new: true})
		res.status(200).json(result)
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
})

postRouter.put("/dislike", async (req, res) => {
  try {
		const {postId, userId} = req.body
		const result = await PostModel.findByIdAndUpdate(postId, {$pull: {likes: userId}}, {new: true})
		res.status(200).json(result)
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).json({message: e});
  }
})

postRouter.get("/search", async (req, res) => {
	try {
		const {searchQuery} = req.query
		const title = { $regex: searchQuery, $options: "i" };

		const results = await PostModel.find({title}).sort({ createdAt: -1 });

		if (results) {
			res.status(200).json(results)
		}

	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
})