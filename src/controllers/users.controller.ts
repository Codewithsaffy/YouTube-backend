import mongoose from "mongoose";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fileUploader from "../utils/cloudnary.js";
import jwt from "jsonwebtoken";

// ! set cookie
const options = {
  httpOnly: true,
  secure: true,
};

// ! generate access and refresh token
const generateAccessAndRefreshToken = async (
  userId: mongoose.Types.ObjectId,
) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};

//! ==================
//   * register user
//! =================

const registerUser = asyncHandler(async (req: any, res: any) => {
  // get user detail
  // check validation
  // check already exist
  // check images
  // upload images
  // create user object
  // check user creation
  // return response

  // ? get user details
  const { username, email, fullName, passward } = await req.body;
  console.log("username:", username);

  // ? check user validation
  if (
    [username, email, fullName, passward].some((item) => {
      return item === "" || item === null || item === undefined;
    })
  ) {
    throw new ApiError(400, "any field will not be empty");
  }

  // ? check user exist or not

  const existUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existUser) {
    throw new ApiError(404, "this user already exist");
  }

  //? check files uploaded in in server

  const avatarLocalPath = await req?.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // ? upload files in cloudnary

  const avatar = await fileUploader(avatarLocalPath);
  const coverImage = await fileUploader(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // ? create new user

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    passward,
    avatar: avatar?.url,
    coverImage: coverImage?.url,
  });

  // ? check user created or not and remove passward and refreshtocken
  const createdUser = await User.findOne(user._id).select(
    "-passward -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(404, "user not created successfully");
  }
  return res
    .status(400)
    .json(new ApiResponse(201, "user created successfull", createdUser));
});

//! ==================
//   * login user
//! =================
const loginUser = asyncHandler(async (req: any, res: any) => {
  // get user detail {username or email, passward}
  // check user is available or not
  // if available so check passward
  // access and refresh token
  // set cookie
  // * 1- get user detail

  const { username, email, passward } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  // * 2- check user

  console.log("login user:", user);
  console.log("login passward:", passward);
  if (!user) {
    throw new ApiError(404, "user not found ");
  }

  // * 3- check passward

  const isPasswardCorrect = await user.isPasswardCorrect(passward);
  console.log("isPasswardCorrect:", isPasswardCorrect);

  if (!isPasswardCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // * 4- generate access and refresh token

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const logedInUser = await User.findOne(user._id).select(
    "-passward -refreshToken",
  );
  // * 5- set cookie

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(200, "login successfull", {
        user: logedInUser,
        refreshToken,
        accessToken,
      }),
    );
});

//! ==================
// * logout user
//! ==================

const logoutUser = asyncHandler(async (req: any, res: any) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: "", // this removes the field from document
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged Out", {}));
});
//! ==================
// * refresh assecc tocken user
//! ==================

const refreshtockenUser = asyncHandler(async (req: any, res: any) => {
  try {
    const inComingRefreshtocken =
      req.cookies?.refreshToken || req.body?.refreshtocken;

    if (!inComingRefreshtocken) {
      throw new ApiError(401, "Please provide refreshtocken");
    }
    const decodedToken = jwt.verify(
      inComingRefreshtocken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as any;

    const user = await User.findOne(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    if (inComingRefreshtocken !== user.refreshToken) {
      throw new ApiError(401, "refresh token is used or invalid");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "refresh access token successfull", {
          accessToken,
          refreshToken,
        }),
      );
  } catch (error) {
    throw new ApiError(500, "failed to refresh access token");
  }
});

export { registerUser, loginUser, logoutUser, refreshtockenUser };
