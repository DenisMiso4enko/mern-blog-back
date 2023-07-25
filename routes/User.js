import chalk from "chalk";
import {Router} from "express";
import {UserModel} from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {PostModel} from "../models/Post.js";

// const secretKey = "secretKey111"
const jwtSecret = 'your-secret-key';
const refreshTokenSecret = 'your-refresh-secret-key';

export const userRouter = Router({mergeParams: true});

function generateTokens(user) {
	const accessTokenPayload = {id: user._id};
	const refreshTokenPayload = {id: user._id};

	const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {expiresIn: '1h'});
	const refreshToken = jwt.sign(refreshTokenPayload, refreshTokenSecret, {expiresIn: '7d'});

	return {accessToken, refreshToken};
}

// register
userRouter.post("/register", async (req, res) => {
	try {
		const {name, email, password} = req.body;
		const existedUser = await UserModel.findOne({$or: [{name}, {email}]});
		if (existedUser) {
			res
				.status(400)
				.json({message: "'Username or email already exists' });"});
		}
		const hashedPassword = await bcrypt.hash(password, 12);

		const newUser = await UserModel.create({
			name,
			email,
			password: hashedPassword
		});

		const {accessToken, refreshToken} = generateTokens(newUser);
		res.cookie('accessToken', accessToken, {httpOnly: true});
		res.cookie('refreshToken', refreshToken, {httpOnly: true});
		res.json({message: 'Registration successful', token: accessToken, user: newUser});

		res.status(201).json({...tokens, user: newUser});
	} catch (error) {
		console.log(chalk.red(error));
		res.status(500).json({message: "Server error"});
	}
});

// login
userRouter.post("/login", async (req, res) => {
	const {email, password} = req.body;
	try {
		const existingUser = await UserModel.findOne({email})
		if (!existingUser) {
			res.status(400).json({message: "User not found"});
		}
		const isPasswordEqual = await bcrypt.compare(
			password,
			existingUser.password
		);

		if (!isPasswordEqual) {
			return res.status(400).json({message: "INVALID_PASSWORD"});
		}

		const accessToken = jwt.sign({existingUser}, jwtSecret, {expiresIn: '1h'});
		const refreshToken = jwt.sign({existingUser}, refreshTokenSecret, {expiresIn: '7d'});

		res
			.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: 'strict'})
			.header('Authorization', accessToken)
			.send(existingUser);
	} catch (error) {
		console.log(chalk.red(error));
		res.status(500).json({message: "Server error"});
	}
});

// get profile
userRouter.post("/authenticate", async (req, res, next) => {
	const accessToken = req.headers['authorization'];
	console.log(accessToken)
	const refreshToken = req.cookies['refreshToken'];

	if (!accessToken && !refreshToken) {
		return res.status(401).send('Access Denied. No token provided.');
	}

	try {
		const decoded = jwt.verify(accessToken, jwtSecret);
		req.user = decoded.user;
		next();
	} catch (error) {
		if (!refreshToken) {
			return res.status(401).send('Access Denied. No refresh token provided.');
		}

		try {
			const decoded = jwt.verify(refreshToken, jwtSecret);
			const accessToken = jwt.sign({user: decoded.user}, jwtSecret, {expiresIn: '1h'});

			res
				.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: 'strict'})
				.header('Authorization', accessToken)
				.send(decoded.user);
		} catch (error) {
			return res.status(400).send('Invalid Token.');
		}
	}
});

// refreshToken;
userRouter.post("/refresh", async (req, res) => {
	const refreshToken = req.cookies['refreshToken'];
	if (!refreshToken) {
		return res.status(401).send('Access Denied. No refresh token provided.');
	}

	try {
		const decoded = jwt.verify(refreshToken, jwtSecret);
		const accessToken = jwt.sign({user: decoded.user}, jwtSecret, {expiresIn: '1h'});

		res
			.header('Authorization', accessToken)
			.send(decoded.user);
	} catch (error) {
		return res.status(400).send('Invalid refresh token.');
	}
});


userRouter.put("/addToFavorites", async (req, res) => {
	try {
		const {postId, userId} = req.body;
		const result = await UserModel.findByIdAndUpdate(
			userId,
			{$push: {favorites: postId}},
			{new: true}
		);
		res.status(200).json(result);
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
});

userRouter.put("/removeFromFavorites", async (req, res) => {
	try {
		const {postId, userId} = req.body;
		const result = await UserModel.findByIdAndUpdate(
			userId,
			{$pull: {favorites: postId}},
			{new: true}
		);
		res.status(200).json(result);
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
});

userRouter.post("/getFavorites", async (req, res) => {
	try {
		const favorites = req.body;

		const posts = await PostModel.find();
		const result = [];
		posts.forEach((post) => {
			if (favorites.includes(post.id)) {
				result.push(post);
			}
		});
		if (result) {
			res.status(200).json(result);
		}
	} catch (e) {
		console.log(chalk.red(e));
		res.status(500).json({message: e});
	}
});
