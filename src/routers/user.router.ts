import { Router } from "express";
import {
  addNewUser,
  deleteUser,
  getUserByPhone,
  updateUser,
  activateUser,
  deactivateUser,
  getAllUsers,
} from "../controllers/user.controller";
import {
  mwValidateId,
  mwValidatePhone,
  mwValidateUserData,
} from "../middlewares/userDataValidator";
import giveAccessTo from "../middlewares/authentication/giveAccessTo.middleware";
import isLoggedIn from "../middlewares/authentication/login.middleware";
import { limiter } from "../middlewares/rate-limiter";

const userRouter = Router();

userRouter.get(
  "/phone/:phone",
  isLoggedIn,
  giveAccessTo("admin"),
  mwValidatePhone,
  getUserByPhone
);
userRouter.get("/getAll", isLoggedIn, giveAccessTo("admin"), getAllUsers);
userRouter.post(
  "/",
  isLoggedIn,
  giveAccessTo("admin"),
  mwValidateUserData,
  addNewUser
);
userRouter.patch(
  "/update/:id",
  isLoggedIn,
  giveAccessTo("admin"),
  mwValidateId,
  updateUser
);
userRouter.patch(
  "/activate/:id",
  isLoggedIn,
  giveAccessTo("admin"),
  mwValidateId,
  activateUser
);
userRouter.patch(
  "/deactivate/:id",
  isLoggedIn,
  giveAccessTo("admin"),
  mwValidateId,
  deactivateUser
);
userRouter.delete(
  "/:id",
  isLoggedIn,
  giveAccessTo("admin"),
  mwValidateId,
  deleteUser
);
export default userRouter;
