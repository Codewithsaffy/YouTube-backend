import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAsseccTockenUser,
  registerUser,
} from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// await dbConnection();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

// secured route

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAsseccTockenUser);
export default router;
