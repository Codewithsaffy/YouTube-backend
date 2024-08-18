import mongoose from "mongoose";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fileUploader from "../utils/cloudnary.js";
import jwt from "jsonwebtoken";
import { Response } from "express";

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

const registerUser = asyncHandler(async (req: any, res: Response) => {
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
const loginUser = asyncHandler(async (req: any, res: Response) => {
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

const logoutUser = asyncHandler(async (req: any, res: Response) => {
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

const refreshAsseccTockenUser = asyncHandler(
  async (req: any, res: Response) => {
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
  },
);

//! ==================
// * change user passward
//! ==================

const changedUserPassward = asyncHandler(async (req: any, res: Response) => {
  const { oldPassward, newPassward } = req.body;
  const user = await User.findById(req?.user?._id);
  const isPasswardCorrect = await user.isPasswardCorrect(oldPassward);
  if (!isPasswardCorrect) {
    throw new ApiError(400, "invalid old passward");
  }
  user.passward = newPassward;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "passward change successfully", {}));
});

//! ==================
// * get current user
//! ==================

const getCurrentUser = asyncHandler(async (req: any, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "current user fetched successfully", req?.user));
});

//! ==================
// * update user details
//! ==================

const updateUserDetail = asyncHandler(async (req: any, res: Response) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "fullname and email is required");
  }
  const updatedUser = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }, // new:true return an updated user
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "user updated susseccfully", updatedUser));
});

//! ==================
// * update User Avatar
//! ==================

const updateUserAvatar = asyncHandler(async (req: any, res: Response) => {
  const newAvatarPath = req?.file?.path;

  if (!newAvatarPath) {
    throw new ApiError(401, "failed to get new avatar file path");
  }
  const avatar = await fileUploader(newAvatarPath);
  if (!avatar?.url) {
    throw new ApiError(401, "failed to upload new avatar file");
  }

  const updatedUser = await User.findByIdAndUpdate(req?.user?._id, {
    $set: {
      avatar: avatar.url,
    },
  }).select("-passward");

  return res
    .status(200)
    .json(new ApiResponse(200, "new avatar updated successfully", updatedUser));
});

//! ==================
// * update User CoverImage
//! ==================

const updateUserCoverImage = asyncHandler(async (req: any, res: Response) => {
  const newCoverImagePath = req?.file?.path;

  if (!newCoverImagePath) {
    throw new ApiError(401, "failed to get new CoverImage file path");
  }

  const CoverImage = await fileUploader(newCoverImagePath);
  if (!CoverImage?.url) {
    throw new ApiError(401, "failed to upload new CoverImage file");
  }

  const updatedUser = await User.findByIdAndUpdate(req?.user?._id, {
    $set: {
      coverImage: CoverImage.url,
    },
  }).select("-passward");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "new coverImage updated successfully", updatedUser),
    );
});

//! ==================
// * generate channel detail
//! ==================

const getUserChannelProfile = asyncHandler(async (req: any, res: Response) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username not found");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subcribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedTo: {
          $size: "$subcribedTo",
        },
        isSubscribed: {
          $cond: { $in: [req?.user?._id, "$subscribers.subscriber"] },
          $then: true,
          $else: false,
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        channelSubscribedTo: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(401, "channel not exist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "channel details fetched successfully", channel[0]),
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAsseccTockenUser,
  changedUserPassward,
  getCurrentUser,
  updateUserDetail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
};
