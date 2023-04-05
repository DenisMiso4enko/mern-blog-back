import jwt from "jsonwebtoken";
import config from "config";
import { TokenModel } from "../models/Token.js";

class TokenService {
  // return accessToken, refreshToken, expiresIn
  generate(payload) {
    const accessToken = jwt.sign(payload, config.get("accessSecret"), {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, config.get("refreshSecret"));
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  async save(userId, refreshToken) {
    const data = await TokenModel.findOne({ user: userId });
    if (data) {
      data.refreshToken = refreshToken;
      return data.save();
    }

    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  validateRefresh(refreshToken) {
    try {
      return jwt.verify(refreshToken, config.get("refreshSecret"));
    } catch (e) {
      return null;
    }
  }

  validateAccess(accessToken) {
    try {
      return jwt.verify(accessToken, config.get("accessSecret"));
    } catch (e) {
      return null;
    }
  }

  async findToken(refreshToken) {
    try {
      return await TokenModel.findOne({ refreshToken });
    } catch (e) {
      return null;
    }
  }
}

export const classToken = new TokenService();
