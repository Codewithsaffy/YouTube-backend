import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fileUploader from "../utils/cloudnary.js";

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
  const { username, email, fullName, password } = req.body;
  console.log("username:", username);

  // ? check user validation
  if (
    [username, email, fullName, password].some((item) => {
      return item === "" || item === null || item === undefined;
    })
  ) {
    throw new ApiError(400, "any field will not be empty");
  }

  // ? check user exist or not

  const existUser = await User.findOne({
    $or: [email, username],
  });
  if (existUser) {
    throw new ApiError(404, "this user already exist");
  }

  //? check files uploaded in in server

  const avatarLocalPath = req?.files?.avatar?.path;
  const coverImageLocalPath = req?.files?.coverImage?.path;
  if (avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // ? upload files in cloudnary

  const avatar = await fileUploader(avatarLocalPath);
  const coverImage = await fileUploader(coverImageLocalPath);

  // ? create new user

  const user = await User.create({
    username: username.lowercase(),
    email,
    fullName,
    password,
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
    .json(new ApiResponse(201, createdUser, "user created successfull"));
});

export { registerUser };
