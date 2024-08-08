import { Router } from "express";
import { loginUser, logoutUser, refreshAccessTokens, registerUser } from "../Controllers/user.controller.js";
import { upload } from "../Middlewares/multer.middleware.js"
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const userRouter=Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)


userRouter.route("/login").post( loginUser)

userRouter.route("/refreshToken").post(refreshAccessTokens)


/// secured routes

userRouter.route("/logout").post(verifyJWT,logoutUser)



export default userRouter