import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },
    avatar: {
      type: String, // cloudnary url
      required: true,
    },
    coverImage: {
      type: String, // cloudnary url
    },
    passward: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// pre middle is use to perform any fn just before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("passward")) return next();

  this.passward = await bcrypt.hash(this.passward, 10);
  next();
});

userSchema.methods.isPasswardCorrect = async function (passward: string) {
  return await bcrypt.compare(passward, this.passward);
};

// * JWT

// jwt is a bearer token which means it is a security token used in web applications and APIs to authenticate and authorize users.

// add method for generate access token

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      passward: this.passward,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};
// add method for generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};
const User = mongoose.model("User", userSchema);

export default User;
